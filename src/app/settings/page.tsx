import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Settings, Trash2, Save, Database, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

async function clearPricingData() {
    "use server";
    try {
        await prisma.priceEntry.deleteMany();
        await prisma.product.deleteMany();
        revalidatePath("/");
        revalidatePath("/pricing");
    } catch (e) {
        console.error("Failed to clear Pricing DB", e);
        throw new Error("Failed to clear Pricing database");
    }
}

async function clearQuoteHistory() {
    "use server";
    try {
        // Cascade delete should handle items if configured, but let's be explicit
        await prisma.quoteItem.deleteMany();
        await prisma.quote.deleteMany();
        revalidatePath("/");
        revalidatePath("/quotes");
    } catch (e) {
        console.error("Failed to clear Quote DB", e);
        throw new Error("Failed to clear Quote database");
    }
}

export default async function SettingsPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Settings className="h-6 w-6" /> System Settings
                </h1>
                <p className="text-muted-foreground mt-1">Manage system configurations and data.</p>
            </div>

            <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Application Defaults</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Name (Default for Quotes)</label>
                            <input
                                type="text"
                                defaultValue="My Company Inc."
                                className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm text-sm"
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">Configurable in future updates.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
                            <input
                                type="number"
                                defaultValue="10"
                                className="mt-1 block w-32 rounded-md border-input border p-2 shadow-sm text-sm"
                                disabled
                            />
                        </div>
                        <button type="button" disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md text-sm font-medium">
                            <Save className="w-4 h-4 inline mr-2" /> Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-medium text-red-900">Danger Zone</h2>

                <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-red-900 flex items-center gap-2">
                                <Database className="w-4 h-4" /> Clear Pricing Inventory
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                Deletes all Uploaded Products and Prices. Does <strong>not</strong> affect existing Quotes.
                            </p>
                        </div>
                        <form action={clearPricingData}>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Inventory
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-red-900 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Clear Quote History
                            </h3>
                            <p className="text-sm text-red-700 mt-1">
                                Deletes all Quotes and BOQs. This action is <strong>irreversible</strong>.
                            </p>
                        </div>
                        <form action={clearQuoteHistory}>
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete All Quotes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
