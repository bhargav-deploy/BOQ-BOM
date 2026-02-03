"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as XLSX from "xlsx";

export async function uploadPriceList(formData: FormData) {
    const file = formData.get("file") as File;
    const vendor = formData.get("oem") as string || "Unknown OEM";

    if (!file) {
        throw new Error("No file uploaded");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON with raw headers
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let successCount = 0;
    let errorCount = 0;

    console.log(`Processing ${rows.length} rows from OEM ${vendor}`);

    for (const row of rows as any[]) {
        // Normalize keys (to handle 'Part Code', 'PartCode', 'sku', etc.)
        // For now, strict mapping or simple heuristic
        // Expected keys: PartCode, Description, Price

        // Simple heuristic: find keys that look like our targets
        const keys = Object.keys(row);
        const codeKey = keys.find(k => /part|sku|code/i.test(k));
        const priceKey = keys.find(k => /price|cost/i.test(k));
        const descKey = keys.find(k => /desc|name|product/i.test(k));

        if (!codeKey || !priceKey) {
            console.warn("Skipping row, missing keys", row);
            errorCount++;
            continue;
        }

        const partCode = String(row[codeKey]).trim();
        const price = parseFloat(row[priceKey]);
        const name = descKey ? String(row[descKey]).trim() : "Imported Product";

        if (!partCode || isNaN(price)) {
            errorCount++;
            continue;
        }

        try {
            // 1. Upsert Product
            const product = await prisma.product.upsert({
                where: { partCode },
                update: {
                    // Only update name if it's currently generic? Or always update?
                    // Let's update name if provided
                    ...(descKey ? { name } : {})
                },
                create: {
                    partCode,
                    name,
                },
            });

            // 2. Add Price Entry
            await prisma.priceEntry.create({
                data: {
                    productId: product.id,
                    vendor,
                    price,
                    currency: "USD", // Default for now, could parse column
                },
            });

            successCount++;
        } catch (e) {
            console.error("Error processing row", partCode, e);
            errorCount++;
        }
    }

    revalidatePath("/pricing");
    return { success: true, imported: successCount, errors: errorCount };
}

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { partCode: { contains: query } },
                { name: { contains: query } }
            ]
        },
        include: {
            prices: {
                orderBy: { effectiveDate: "desc" },
                take: 1
            }
        },
        take: 10
    });

    return products.map(p => ({
        id: p.id,
        partCode: p.partCode,
        name: p.name,
        price: p.prices[0]?.price || 0
    }));
}
