"use client";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Search, Filter, Plus } from "lucide-react";
import Link from "next/link";

interface Invoice {
  id: number;
  invoicenumber: string;
  customername: string;
  issuedate: string;
  duedate: string;
  status: string;
  total: string;
  amountpaid: string;
  balancedue: string;
  isarchived: boolean;
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [minAmount, setMinAmount] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/invoices");
        if (!response.ok) throw new Error("Failed to fetch invoices");
        const data = await response.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const toggleAccordion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // Apply filters
  const filtered = invoices.filter((inv) => {
    const matchesName = inv.customername
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;
    const matchesAmount =
      minAmount === "" || parseFloat(inv.total) >= parseFloat(minAmount);
    return matchesName && matchesStatus && matchesAmount;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  if (error) return <p className="p-6 text-red-500 text-lg">Error: {error}</p>;

  return (
    <div className="w-full text-gray-900">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Invoices</h2>
        <Link
          href="/invoices/create"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl text-base font-bold hover:bg-green-700 transition-colors"
        >
          <Plus size={18} /> New Invoice
        </Link>
      </div>

      {/* ─── FILTERS BAR ─── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search by Name */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by customer name..."
              className="w-full pl-11 pr-4 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PAID">Paid</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Min Amount Filter */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">
              ₹≥
            </span>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min total"
              className="w-full sm:w-44 pl-11 pr-4 py-3.5 bg-gray-100 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Active Filters Count */}
        {(searchName || statusFilter !== "ALL" || minAmount) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-gray-100">
            <span className="text-sm text-gray-500 font-medium">
              Showing {filtered.length} of {invoices.length} invoices
            </span>
            <button
              onClick={() => {
                setSearchName("");
                setStatusFilter("ALL");
                setMinAmount("");
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto transition-colors"
            >
              ✕ Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ─── INVOICE CARDS ─── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-14 text-center">
          <p className="text-gray-400 text-lg">No invoices match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleAccordion(inv.id)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {inv.customername.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{inv.invoicenumber}</p>
                    <p className="text-base text-gray-500">{inv.customername}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="font-bold text-xl">
                      ₹{parseFloat(inv.total).toLocaleString()}
                    </p>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        inv.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  {openId === inv.id ? (
                    <ChevronUp size={22} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={22} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded */}
              {openId === inv.id && (
                <div className="border-t-2 border-gray-100 p-5 bg-gray-50">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-1">Issue Date</p>
                      <p className="font-semibold text-base">
                        {new Date(inv.issuedate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-1">Due Date</p>
                      <p className="font-semibold text-base">
                        {new Date(inv.duedate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-1">Amount Paid</p>
                      <p className="font-semibold text-base text-green-600">
                        ₹{parseFloat(inv.amountpaid).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-xs font-medium text-gray-400 mb-1">Balance Due</p>
                      <p
                        className={`font-semibold text-base ${
                          parseFloat(inv.balancedue) > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ₹{parseFloat(inv.balancedue).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-gray-700 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}