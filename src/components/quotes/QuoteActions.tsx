"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { generatePDF } from "@/lib/pdf-generator";

export function QuoteActions({ quote }: { quote: any }) {
    const handleExportExcel = () => {
        // ... (Excel logic same as before)
        // Prepare data for Excel
        const data = quote.items.map((item: any) => ({
            "Part Code": item.partCode,
            "Description": item.name,
            "Quantity": item.quantity,
            "Unit Cost": item.unitCost,
            "Unit Price": item.unitPrice,
            "Total Price": item.quantity * item.unitPrice
        }));

        // Add Summary Row
        data.push({});
        data.push({ "Description": "Subtotal", "Total Price": quote.totalPrice / (1 + quote.taxRate / 100) });
        data.push({ "Description": `Tax (${quote.taxRate}%)`, "Total Price": quote.totalPrice - (quote.totalPrice / (1 + quote.taxRate / 100)) });
        data.push({ "Description": "Grand Total", "Total Price": quote.totalPrice });

        const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false });
        // Adjust column widths visually if possible (simple auto-width hack not avail in basic xlsx write, but format is better now)
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Quote");
        XLSX.writeFile(wb, `${quote.clientName.replace(/\s+/g, '_')}_Quote.xlsx`);
    };

    const handleDownloadPDF = () => {
        generatePDF(quote);
    };

    return (
        <div className="flex gap-3 print:hidden">
            <button onClick={handleExportExcel} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button onClick={handleDownloadPDF} className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-slate-800 focus:outline-none">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Download PDF</span>
            </button>
        </div>
    );
}
