import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, FileText } from "lucide-react";
import { DeleteQuoteButton } from "@/components/quotes/DeleteQuoteButton";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
    let quotes: any[] = [];
    try {
        quotes = await prisma.quote.findMany({
            orderBy: { updatedAt: "desc" },
            include: { _count: { select: { items: true } } }
        });
    } catch (e) {
        console.error("Quotes Page DB Error:", e);
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Left Col: Quotes List */}
            <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg shadow-indigo-500/10 overflow-hidden glass">
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Quotes & BOQ</h1>
                        <p className="text-indigo-500 text-xs font-medium">Manage customer quotations</p>
                    </div>
                    <Link href="/quotes/new" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-indigo-200 hover:shadow-none translate-y-0 hover:translate-y-[1px]">
                        <Plus className="-ml-1 mr-2 h-4 w-4" />
                        New Quote
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
                    <ul className="space-y-3">
                        {quotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60">
                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                    <FileText className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No quotes yet</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">Click "New Quote" to create your first Bill of Quantities.</p>
                            </div>
                        ) : (
                            quotes.map((quote) => (
                                <li key={quote.id} className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-300 transition-all duration-200 hover:shadow-md cursor-pointer relative overflow-hidden">
                                    <Link href={`/quotes/${quote.id}`} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-50 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <FileText className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{quote.clientName || "Untitled Quote"}</div>
                                                <div className="text-xs text-gray-500">
                                                    Created {new Date(quote.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(quote.totalPrice)}
                                                </div>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 uppercase tracking-wide">
                                                    {quote.status}
                                                </div>
                                            </div>
                                            {/* Action Stop propagation not needed if we want whole row clickable, but delete needs layout */}
                                        </div>
                                    </Link>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DeleteQuoteButton id={quote.id} clientName={quote.clientName} />
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            {/* Right Side Panel */}
            <div className="w-80 hidden lg:flex flex-col gap-6">
                {/* Summary Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="bg-indigo-100 p-1 rounded text-indigo-600">📊</span> Analytics
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                $0.00
                            </p>
                            <p className="text-xs text-gray-400">Across {quotes.length} quotes</p>
                        </div>
                        <div className="h-px bg-gray-100 w-full" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Active Deals</p>
                            <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Draft</span>
                                    <span className="font-medium text-gray-900">{quotes.filter(q => q.status === 'DRAFT').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Approved</span>
                                    <span className="font-medium text-gray-900">{quotes.filter(q => q.status === 'APPROVED').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Import Card */}
                <div className="bg-indigo-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="relative z-10">
                        <h3 className="font-semibold mb-2">Import Excel?</h3>
                        <p className="text-indigo-200 text-sm mb-4">
                            You can upload a BOQ directly from an Excel file to get started faster.
                        </p>
                        <button className="text-xs bg-white text-indigo-900 font-bold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            Upload File
                        </button>
                    </div>
                    {/* Decorative Blob */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
                </div>
            </div>
        </div>
    );
}
