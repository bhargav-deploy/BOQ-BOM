import { prisma } from "@/lib/prisma";
import { PriceUploader } from "@/components/pricing/PriceUploader";


export const dynamic = "force-dynamic";

export default async function PricingPage() {
    let products: any[] = [];
    try {
        products = await prisma.product.findMany({
            include: {
                prices: {
                    orderBy: { effectiveDate: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 100, // Limit for performance
        });
    } catch (e) {
        console.error(e);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Pricing Database</h1>
                    <p className="text-muted-foreground">Manage centralized pricing from all OEMs.</p>
                </div>
            </div>

            <PriceUploader />

            <div className="bg-white rounded-lg border border-border overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Part Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Latest Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">OEM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Updated</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No products found. Upload a price list to get started.
                                </td>
                            </tr>
                        ) : (
                            products.map((product: any) => {
                                const latestPrice = product.prices[0];
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{product.partCode}</td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-accent">
                                            {latestPrice
                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: latestPrice.currency }).format(latestPrice.price)
                                                : "N/A"
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {latestPrice?.vendor || "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.updatedAt.toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })
                        )}

                    </tbody>
                </table>
            </div>
        </div>
    );
}
