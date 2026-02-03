"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createQuote(formData: FormData) {
    const clientName = formData.get("clientName") as string;
    const customerId = formData.get("customerId") as string;

    if (!clientName) {
        throw new Error("Client Name is required");
    }

    const quote = await prisma.quote.create({
        data: {
            clientName,
            customerId: customerId || null,
            status: "DRAFT",
        }
    });

    redirect(`/quotes/${quote.id}`);
}

export async function addQuoteItem(quoteId: string, partCode: string, quantity: number = 1) {
    // 1. Find Product and Price
    const product = await prisma.product.findUnique({
        where: { partCode },
        include: { prices: { orderBy: { effectiveDate: "desc" }, take: 1 } }
    });

    if (!product) {
        throw new Error("Product not found");
    }

    const priceEntry = product.prices[0];
    const unitCost = priceEntry ? priceEntry.price : 0;

    // 2. Add Item
    await prisma.quoteItem.create({
        data: {
            quoteId,
            partCode: product.partCode,
            name: product.name,
            quantity,
            unitCost,
            unitPrice: unitCost * 1.1, // Initial margin assumption (will be valid via Quote global margin)
        }
    });

    revalidatePath(`/quotes/${quoteId}`);
}

export async function updateQuote(id: string, updates: { margin?: number; taxRate?: number }) {
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!quote) throw new Error("Quote not found");

    const margin = updates.margin ?? quote.margin;
    const taxRate = updates.taxRate ?? quote.taxRate;

    // Recalculate all items
    let totalCost = 0;
    let totalPrice = 0;

    const itemUpdates = quote.items.map(item => {
        const cost = item.unitCost * item.quantity;
        // Calculation: Sell Price = Cost + (Cost * Margin / 100) -> Markup model?
        // Or Margin model: Sell Price = Cost / (1 - Margin/100)?
        // Let's use Markup for simplicity unless specified, but User said "Margin". 
        // Usually sales margin is (Price - Cost) / Price.
        // Price = Cost / (1 - Margin%)

        // Safety check for 100% margin
        const marginFactor = 1 - (margin / 100);
        const unitPrice = marginFactor > 0 ? item.unitCost / marginFactor : item.unitCost;

        totalCost += cost;
        totalPrice += unitPrice * item.quantity;

        return prisma.quoteItem.update({
            where: { id: item.id },
            data: { unitPrice }
        });
    });

    await prisma.$transaction([
        ...itemUpdates,
        prisma.quote.update({
            where: { id },
            data: {
                margin,
                taxRate,
                totalCost,
                totalPrice: totalPrice * (1 + taxRate / 100) // Tax on top of Price
            }
        })
    ]);

    revalidatePath(`/quotes/${id}`);
}

export async function deleteQuoteItem(itemId: string, quoteId: string) {
    await prisma.quoteItem.delete({ where: { id: itemId } });
    await updateQuote(quoteId, {}); // Recalculate
}

export async function deleteQuote(id: string) {
    // Determine if we need to cascade delete items? 
    // Prisma cascading usually handles it if configured, or we do it manually.
    // Let's delete items first to be safe or rely on cascade.
    // For now manual delete of items
    await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    await prisma.quote.delete({ where: { id } });
    revalidatePath("/quotes");
}
