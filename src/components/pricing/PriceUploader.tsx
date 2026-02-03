"use client";

import { useState } from "react";
import { uploadPriceList } from "@/app/actions/pricing";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

export function PriceUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsUploading(true);
        setResult(null);
        try {
            const res = await uploadPriceList(formData);
            setResult(res);
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-border mb-8">
            <h2 className="text-lg font-semibold mb-4 text-primary">Import Price List</h2>
            <form action={handleSubmit} className="flex gap-4 items-end">
                <div className="grid gap-2">
                    <label htmlFor="file" className="text-sm font-medium text-gray-700">Excel File (.xlsx)</label>
                    <input
                        type="file"
                        name="file"
                        accept=".xlsx, .xls, .csv"
                        required
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-100 file:text-slate-700
              hover:file:bg-slate-200
            "
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="oem" className="text-sm font-medium text-gray-700">OEM Name</label>
                    <input
                        type="text"
                        name="oem"
                        placeholder="e.g. Dell, Cisco"
                        className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isUploading}
                    className={clsx(
                        "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
                        isUploading && "opacity-75 cursor-not-allowed"
                    )}
                >
                    {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {isUploading ? "Importing..." : "Upload"}
                </button>
            </form>

            {result && (
                <div className={`mt-4 p-4 rounded-md flex items-center gap-2 ${result.errors > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
                    {result.errors > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    <span>Imported {result.imported} products. {result.errors > 0 && `Skipped ${result.errors} rows (check format).`}</span>
                </div>
            )}
        </div>
    );
}
