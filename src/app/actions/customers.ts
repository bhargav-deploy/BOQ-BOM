"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name) {
        throw new Error("Customer Name is required");
    }

    try {
        await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
            }
        });
        revalidatePath("/customers");
        revalidatePath("/quotes/new");
        return { success: true };
    } catch (e) {
        console.error("Failed to create customer", e);
        return { success: false, error: "Failed to create customer" };
    }
}

export async function getCustomers() {
    try {
        return await prisma.customer.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.error("Failed to fetch customers", e);
        return [];
    }
}

export async function deleteCustomer(id: string) {
    try {
        await prisma.customer.delete({ where: { id } });
        revalidatePath("/customers");
        revalidatePath("/quotes/new");
        return { success: true };
    } catch (e) {
        console.error("Failed to delete customer", e);
        return { success: false, error: "Failed to delete customer" };
    }
}
