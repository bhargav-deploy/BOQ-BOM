import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, FilePlus, Database } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "SALES";
  const userName = session?.user?.name || "User";

  let productCount = 0;
  let quoteCount = 0;

  try {
    productCount = await prisma.product.count();
    quoteCount = await prisma.quote.count();
  } catch (e) {
    console.error("Dashboard DB Error:", e);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl">
        <div className="relative p-8 sm:p-10">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userName}! 👋</h2>
              <p className="mt-2 text-indigo-100 text-lg max-w-2xl">
                Ready to accelerate your workflow? Check your latest quotes or update the pricing database.
              </p>
            </div>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Pricing (Admin Only) */}
        {role === "ADMIN" && (
          <div className="group bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Database className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{productCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <Link href="/pricing" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center group-hover:translate-x-1 transition-transform">
                Manage Pricing <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Card 2: Quotes */}
        <div className="group bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <FilePlus className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{quoteCount.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <Link href="/quotes/new" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center group-hover:translate-x-1 transition-transform">
              Create New Quote <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
