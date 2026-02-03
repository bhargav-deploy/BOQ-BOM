import { prisma } from "@/lib/prisma";
import { createCustomer } from "@/app/actions/customers";
import { UserPlus, Users, MapPin, Phone, Mail } from "lucide-react";
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await prisma.customer.findMany({
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Customers</h1>
                    <p className="text-muted-foreground">Manage your client database.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Customer Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-border h-fit">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                        <UserPlus className="w-5 h-5" /> Add New Customer
                    </h2>
                    <form action={createCustomer} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company / Name</label>
                            <input name="name" type="text" required className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm text-sm" placeholder="Acme Corp" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                            <input name="email" type="email" className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm text-sm" placeholder="contact@acme.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                            <input name="phone" type="text" className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm text-sm" placeholder="+1 234 567 890" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                            <textarea name="address" rows={3} className="mt-1 block w-full rounded-md border-input border p-2 shadow-sm text-sm" placeholder="123 Business Rd..." />
                        </div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
                            Save Customer
                        </button>
                    </form>
                </div>

                {/* Customer List */}
                <div className="lg:col-span-2 space-y-4">
                    {customers.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No customers yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Add your first client to get started.</p>
                        </div>
                    ) : (
                        customers.map((customer) => (
                            <div key={customer.id} className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{customer.name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:gap-4 mt-1 text-sm text-gray-500">
                                        {customer.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>}
                                        {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                                    </div>
                                    {customer.address && (
                                        <p className="mt-2 text-sm text-gray-600 flex items-start gap-1">
                                            <MapPin className="w-3 h-3 mt-0.5" /> {customer.address}
                                        </p>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400 flex flex-col items-end gap-2">
                                    <span>Added {customer.createdAt.toLocaleDateString()}</span>
                                    <DeleteCustomerButton id={customer.id} name={customer.name} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
