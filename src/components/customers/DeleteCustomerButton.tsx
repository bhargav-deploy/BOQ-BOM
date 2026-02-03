"use client";

import { deleteCustomer } from "@/app/actions/customers";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

export function DeleteCustomerButton({ id, name }: { id: string, name: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            startTransition(async () => {
                await deleteCustomer(id);
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Delete Customer"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
