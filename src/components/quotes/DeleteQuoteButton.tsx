"use client";

import { Trash2 } from "lucide-react";
import { deleteQuote } from "@/app/actions/quotes";
import { useState } from "react";

export function DeleteQuoteButton({ id, clientName }: { id: string, clientName: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete the quote for "${clientName}"?\nThis action cannot be undone.`)) {
            setIsDeleting(true);
            await deleteQuote(id);
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Quote"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
