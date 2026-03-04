"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";
import Link from "next/link";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = value as string;
    } else if (field === "quantity") {
      updated[index].quantity = Math.max(1, Number(value));
    } else if (field === "unitPrice") {
      updated[index].unitPrice = Math.max(0, Number(value));
    }
    setLineItems(updated);
  };

  const total = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!invoiceNumber || !customerName || !issueDate || !dueDate) {
      setError("Please fill in all invoice fields");
      return;
    }

    const hasEmptyItem = lineItems.some(
      (item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0
    );
    if (hasEmptyItem) {
      setError("Please fill in all line item fields with valid values");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:8000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          customerName,
          issueDate,
          dueDate,
          lineItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create invoice");
      }

      const created = await res.json();
      router.push(`/invoices/${created.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full text-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-3xl font-bold">New Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT — Form Fields */}
          <div className="lg:col-span-3 space-y-8">
            {/* Invoice Details Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
                Invoice Details
              </h2>

              {/* Customer Name */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-400 mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
              </div>

              {/* Invoice Number + Dates */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-XXXX"
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
                Invoice Items
              </h2>

              {/* Header */}
              <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        placeholder="Item description"
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", e.target.value)}
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, "unitPrice", e.target.value)}
                        className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2 text-right text-sm font-semibold text-gray-500">
                      ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length <= 1}
                        className="text-red-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={addLineItem}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* Error + Submit */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 text-center border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl text-base font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Save as Draft"}
              </button>
            </div>
          </div>

          {/* RIGHT — Live Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7 sticky top-6">
              {/* Preview Header */}
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-2xl font-bold text-green-700">Preview</h2>
                <div className="w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200 flex items-center justify-center">
                  <FileText size={20} className="text-green-600" />
                </div>
              </div>

              {/* Invoice Number */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice Number</p>
                <p className="text-lg font-bold mt-1">{invoiceNumber || "—"}</p>
              </div>

              {/* Billed To + Due Date */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-100 border-2 border-gray-200 rounded-xl p-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Billed to</p>
                  <p className="text-base font-semibold mt-1">{customerName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due date</p>
                  <p className="text-base font-semibold mt-1">
                    {dueDate ? new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Preview Items */}
              <div className="mb-6">
                <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 pb-3 mb-3">
                  <div className="col-span-5">Items</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                {lineItems.filter(i => i.description).length > 0 ? (
                  lineItems.filter(i => i.description).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-sm py-2 border-b border-gray-100 items-center">
                      <div className="col-span-5 font-semibold">{item.description}</div>
                      <div className="col-span-2 text-center text-gray-500">{item.quantity}</div>
                      <div className="col-span-2 text-center text-gray-500">₹{item.unitPrice.toLocaleString()}</div>
                      <div className="col-span-3 text-right font-semibold">₹{(item.quantity * item.unitPrice).toLocaleString()}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No items yet</p>
                )}
              </div>

              {/* Total */}
              <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-xl text-green-700">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
