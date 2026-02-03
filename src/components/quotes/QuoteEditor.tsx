"use client";

import { useState, useEffect } from "react";
import { addQuoteItem, updateQuote, deleteQuoteItem } from "@/app/actions/quotes";
import { Plus, Trash2, Save, Calculator } from "lucide-react";
import clsx from "clsx";

type QuoteWithItems = {
    id: string;
    clientName: string;
    margin: number;
    taxRate: number;
    totalCost: number;
    totalPrice: number;
    status: string;
    items: any[]; // relaxed type for now due to prisma generation lag
};

export function QuoteEditor({ quote }: { quote: QuoteWithItems }) {
    const [isUpdating, setIsUpdating] = useState(false);

    // Autocomplete state
    const [partCode, setPartCode] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [margin, setMargin] = useState(quote.margin);
    const [taxRate, setTaxRate] = useState(quote.taxRate);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (partCode.length >= 2) {
                setIsSearching(true);
                try {
                    // Import dynamically or use the imported action
                    // We need to import searchProducts at the top, let me add that in a sec
                    const { searchProducts } = await import("@/app/actions/pricing");
                    const results = await searchProducts(partCode);
                    setSuggestions(results);
                    setShowDropdown(true);
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [partCode]);

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        if (!partCode) return;

        setIsUpdating(true);
        setShowDropdown(false); // Hide dropdown
        try {
            await addQuoteItem(quote.id, partCode, quantity);
            setPartCode("");
            setQuantity(1);
            await handleRecalculate();
        } catch (err) {
            alert("Failed to add item: " + err);
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleRecalculate() {
        setIsUpdating(true);
        await updateQuote(quote.id, { margin, taxRate });
        setIsUpdating(false);
    }

    async function handleDelete(itemId: string) {
        if (!confirm("Remove item?")) return;
        setIsUpdating(true);
        await deleteQuoteItem(itemId, quote.id);
        setIsUpdating(false);
    }

    function selectProduct(product: any) {
        setPartCode(product.partCode);
        setShowDropdown(false);
        // Optional: auto-focus quantity or submit?
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Items */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border">
                    <h2 className="text-lg font-semibold mb-4 text-primary">Bill of Quantities (BOQ)</h2>

                    {/* Add Item Form */}
                    <form onSubmit={handleAddItem} className="flex gap-4 mb-6 bg-slate-50 p-4 rounded-md items-end relative">
                        <div className="flex-1 relative">
                            <label className="block text-sm font-medium text-gray-700">Part Code</label>
                            <input
                                value={partCode}
                                onChange={e => {
                                    setPartCode(e.target.value);
                                    if (e.target.value.length < 2) setShowDropdown(false);
                                }}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click
                                onFocus={() => partCode.length >= 2 && setShowDropdown(true)}
                                placeholder="Search Part Code..."
                                className="mt-1 block w-full rounded-md border-input border p-2 text-sm"
                                required
                                autoComplete="off"
                            />

                            {/* Autocomplete Dropdown */}
                            {showDropdown && suggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                    {suggestions.map((product) => (
                                        <li
                                            key={product.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                            onClick={() => selectProduct(product)}
                                        >
                                            <div className="font-medium text-gray-900">{product.partCode}</div>
                                            <div className="text-xs text-gray-500 truncate">{product.name}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showDropdown && suggestions.length === 0 && isSearching && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-2 text-sm text-gray-500">
                                    Searching...
                                </div>
                            )}
                        </div>
                        <div className="w-24">
                            <label className="block text-sm font-medium text-gray-700">Qty</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity || ""}
                                onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                                className="mt-1 block w-full rounded-md border-input border p-2 text-sm"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-3 py-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {quote.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-sm text-primary font-medium">{item.partCode}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600 truncate max-w-xs">{item.name}</td>
                                        <td className="px-3 py-2 text-sm text-right text-gray-900">{item.quantity}</td>
                                        <td className="px-3 py-2 text-sm text-right text-gray-500">${item.unitCost.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-sm text-right text-accent font-medium">${item.unitPrice.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-sm text-right text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right">
                                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column: Commercials */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border sticky top-24">
                    <h2 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-accent" /> Commercials
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Margin (%)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={margin}
                                    onChange={e => setMargin(Number(e.target.value))}
                                    className="w-full accent-accent"
                                />
                                <span className="text-sm font-bold w-12 text-right">{margin}%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                            <input
                                type="number"
                                value={taxRate}
                                onChange={e => setTaxRate(Number(e.target.value))}
                                className="block w-full rounded-md border-input border p-2 text-sm"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Total Cost (Excl. Tax)</span>
                                <span>${quote.totalCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-900 font-medium">
                                <span>Subtotal (Sell Price)</span>
                                <span>${(quote.totalPrice / (1 + quote.taxRate / 100)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax Amount</span>
                                <span>${(quote.totalPrice - (quote.totalPrice / (1 + quote.taxRate / 100))).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-accent pt-2 border-t border-gray-200">
                                <span>Final Total</span>
                                <span>${quote.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleRecalculate}
                            disabled={isUpdating}
                            className="w-full mt-4 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isUpdating ? "Updating..." : "Update Calculation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
