import { prisma } from "@/lib/prisma";
import { QuoteEditor } from "@/components/quotes/QuoteEditor";
import { QuoteActions } from "@/components/quotes/QuoteActions";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function QuotePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params?.id;

    if (!id) {
        return (
            <div className="p-8 text-red-600">
                Error: Quote ID is missing from the URL.
            </div>
        );
    }

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: { orderBy: { partCode: "asc" } } }
    });

    if (!quote) notFound();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">{quote.clientName}</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quote.status}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                        Quote ID: {quote.id} &bull; Created {quote.createdAt.toLocaleDateString()}
                    </p>
                </div>
                <QuoteActions quote={quote} />
            </div>

            <QuoteEditor quote={quote} />
        </div>
    );
}
