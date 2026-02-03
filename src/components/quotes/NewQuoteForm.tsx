"use client";

import { createQuote } from "@/app/actions/quotes";
import { FileText, Users } from "lucide-react";
import { useState } from "react";

export default function NewQuoteForm({ customers }: { customers: any[] }) {
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [clientName, setClientName] = useState("");

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const custId = e.target.value;
        setSelectedCustomer(custId);

        const customer = customers.find(c => c.id === custId);
        if (customer) {
            setClientName(customer.name);
        } else {
            setClientName("");
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md border border-border">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-xl font-bold text-primary">Start New Quote</h1>
            </div>

            <form action={createQuote} className="space-y-4">
                {customers.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            <Users className="w-3 h-3 inline mr-1" /> Existing Client?
                        </label>
                        <select
                            name="customerId"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2"
                            onChange={handleCustomerChange}
                            value={selectedCustomer}
                        >
                            <option value="">-- Select a Customer --</option>
                            {customers.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">Client / Project Name</label>
                    <input
                        type="text"
                        name="clientName"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Acme Corp Server Refresh"
                        className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">You can modify this for the specific project.</p>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                    Create Quote
                </button>
            </form>
        </div>
    );
}
