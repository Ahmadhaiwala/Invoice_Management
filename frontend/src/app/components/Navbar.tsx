"use client";
import { Home, FileText, Wallet, BarChart2, HandCoins, Lock, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <div className="w-64 min-w-[16rem] h-screen bg-gray-100 border-r-2 border-gray-200 flex flex-col p-5 text-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center">
          <HandCoins size={22} color="white" />
        </div>
        <h1 className="text-xl font-semibold">Monefy</h1>
      </div>

      {/* Business Account */}
      <div className="rounded-xl p-3 shadow-sm mb-8 bg-yellow-100 border-2 border-yellow-200">
        <div className="flex items-center gap-2">
          <Lock size={16} />
          <div>
            <p className="font-semibold text-sm">Admin</p>
            <p className="text-xs text-gray-500">Business Account</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="mb-6 flex-1">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">
          Main Menu
        </p>

        <ul className="flex flex-col gap-2">
          {/* Disabled - Coming Soon */}
          <li className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed select-none">
            <Home size={18} />
            <span>Dashboard</span>
            <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
              Soon
            </span>
          </li>

          <li className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed select-none">
            <FileText size={18} />
            <span>Transactions</span>
            <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
              Soon
            </span>
          </li>

          <li className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed select-none">
            <Wallet size={18} />
            <span>My Wallet</span>
            <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold">
              Soon
            </span>
          </li>

          {/* Active */}
          <Link href="/">
            <li className="flex items-center gap-3 p-2 rounded-lg bg-gray-200 cursor-pointer font-semibold">
              <BarChart2 size={18} />
              Invoices
            </li>
          </Link>
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border-2 border-red-100 text-red-600 hover:bg-red-100 transition-colors font-semibold text-sm"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}