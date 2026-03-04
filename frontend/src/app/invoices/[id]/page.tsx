"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  CreditCard,
  ArrowLeft,
  Plus,
  X,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface InvoiceData {
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

interface LineItem {
  id: number;
  invoiceid: number;
  description: string;
  quantity: number;
  unitprice: string;
  linetotal: string;
}

interface Payment {
  id: number;
  invoiceid: number;
  amount: string;
  paymentdate: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      const [invRes, linesRes, paymentsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/invoice/${id}`),
        fetch(`http://localhost:8000/api/invoice/${id}/lines`),
        fetch(`http://localhost:8000/api/invoice/${id}/payments`),
      ]);
      if (!invRes.ok) throw new Error("Invoice not found");
      const [invData, linesData, paymentsData] = await Promise.all([
        invRes.json(),
        linesRes.json(),
        paymentsRes.json(),
      ]);
      setInvoice(invData);
      setLineItems(linesData);
      setPayments(paymentsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  const handleAddPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError("Please enter a valid amount greater than 0");
      return;
    }
    const balance = parseFloat(invoice?.balancedue || "0");
    if (amount > balance) {
      setPaymentError(`Amount cannot exceed balance due (₹${balance.toFixed(2)})`);
      return;
    }
    setSubmitting(true);
    setPaymentError(null);
    try {
      const res = await fetch(`http://localhost:8000/api/invoice/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add payment");
      }
      setShowModal(false);
      setPaymentAmount("");
      setLoading(true);
      await fetchAll();
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mt-10">
        <p className="text-red-500 text-xl">Error: {error || "Invoice not found"}</p>
        <Link href="/" className="text-blue-600 underline mt-3 inline-block text-lg">← Back to invoices</Link>
      </div>
    );
  }

  const isPaid = invoice.status === "PAID";
  const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.linetotal || "0"), 0);

  return (
    <div className="w-full text-gray-900">
      {/* ─── TOP BAR ─── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-3xl font-bold">Invoice Details</h1>
        </div>
        <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-base font-bold ${isPaid ? "bg-green-100 text-green-700 border-2 border-green-200" : "bg-yellow-100 text-yellow-700 border-2 border-yellow-200"}`}>
          {isPaid ? <CheckCircle size={18} /> : <Clock size={18} />}
          {invoice.status}
        </span>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-8">

          {/* Invoice Info Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
              Invoice Information
            </h2>

            {/* Bill To */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 mb-2">Bill to</p>
              <div className="flex items-center gap-4 bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {invoice.customername.charAt(0)}
                </div>
                <p className="font-semibold text-lg">{invoice.customername}</p>
              </div>
            </div>

            {/* Invoice Number + Dates */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Invoice number</p>
                <div className="bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4">
                  <p className="font-semibold text-lg">{invoice.invoicenumber}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Due date</p>
                <div className="bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <p className="font-semibold text-base">
                    {new Date(invoice.duedate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Issue date</p>
                <div className="bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4 flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <p className="font-semibold text-base">
                    {new Date(invoice.issuedate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">
              Invoice Items
            </h2>

            {/* Items Header */}
            <div className="grid grid-cols-12 gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
              <div className="col-span-5">Items</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-center">Rate</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {/* Items Rows */}
            {lineItems.length > 0 ? (
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-center bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4">
                    <div className="col-span-5 font-semibold text-base">{item.description}</div>
                    <div className="col-span-2 text-center">
                      <span className="inline-block bg-white border-2 border-gray-200 rounded-lg px-4 py-1.5 text-base font-medium">{item.quantity}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="inline-block bg-white border-2 border-gray-200 rounded-lg px-4 py-1.5 text-base font-medium">{parseFloat(item.unitprice).toLocaleString()}</span>
                    </div>
                    <div className="col-span-3 text-right text-base text-gray-500 font-semibold">₹{parseFloat(item.linetotal).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-base">No line items found</p>
              </div>
            )}
          </div>

          {/* Payments Card */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="p-7 pb-5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payments</h2>
              {!isPaid && (
                <button
                  onClick={() => { setShowModal(true); setPaymentError(null); setPaymentAmount(""); }}
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors"
                >
                  <Plus size={16} /> Add Payment
                </button>
              )}
            </div>

            {payments.length > 0 ? (
              <div className="px-7 pb-6 space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-gray-100 border-2 border-gray-200 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                        <CreditCard size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">Payment</p>
                        <p className="text-sm text-gray-400">
                          {new Date(p.paymentdate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600 text-lg">+ ₹{parseFloat(p.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-7 pb-7">
                <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400 text-base">No payments recorded yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — Invoice Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-7 sticky top-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-2xl font-bold text-green-700">Invoice</h2>
              <div className="w-10 h-10 rounded-xl bg-green-100 border-2 border-green-200 flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
            </div>

            {/* Invoice Number */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice Number</p>
              <p className="text-lg font-bold mt-1">{invoice.invoicenumber}</p>
            </div>

            {/* Billed To + Due Date */}
            <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-100 border-2 border-gray-200 rounded-xl p-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Billed to</p>
                <p className="text-base font-semibold mt-1">{invoice.customername}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due date</p>
                <p className="text-base font-semibold mt-1">
                  {new Date(invoice.duedate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Preview Items Table */}
            <div className="mb-6">
              <div className="grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider border-b-2 border-gray-200 pb-3 mb-3">
                <div className="col-span-5">Items</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
              {lineItems.length > 0 ? (
                lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 text-sm py-3 border-b border-gray-100 items-center">
                    <div className="col-span-5 font-semibold">{item.description}</div>
                    <div className="col-span-2 text-center text-gray-500">{item.quantity}</div>
                    <div className="col-span-2 text-center text-gray-500">₹{parseFloat(item.unitprice).toLocaleString()}</div>
                    <div className="col-span-3 text-right font-semibold">₹{parseFloat(item.linetotal).toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No items</p>
              )}
            </div>

            {/* Totals */}
            <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Subtotal</span>
                <span className="font-semibold text-base">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-medium">Amount Paid</span>
                <span className="font-semibold text-base text-green-600">₹{parseFloat(invoice.amountpaid).toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-base">Balance Due</span>
                <span className={`font-bold text-lg ${parseFloat(invoice.balancedue) > 0 ? "text-red-600" : "text-green-600"}`}>
                  ₹{parseFloat(invoice.balancedue).toLocaleString()}
                </span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl text-green-700">₹{parseFloat(invoice.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD PAYMENT MODAL ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-7 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add Payment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-base text-gray-500 mb-4">
                Balance Due: <span className="font-bold text-red-600 text-lg">₹{parseFloat(invoice.balancedue).toFixed(2)}</span>
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balancedue}
                value={paymentAmount}
                onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(null); }}
                placeholder="Enter amount"
                className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {paymentError && <p className="text-red-500 text-base mb-4">{paymentError}</p>}

            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-700 px-5 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white px-5 py-3.5 rounded-xl text-base font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
