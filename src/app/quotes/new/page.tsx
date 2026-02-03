import { prisma } from "@/lib/prisma";
import NewQuoteForm from "@/components/quotes/NewQuoteForm";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
    const customers = await prisma.customer.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center">
            <div className="w-full max-w-lg transform transition-all hover:scale-105 duration-300">
                <NewQuoteForm customers={customers} />
            </div>
        </div>
    );
}
