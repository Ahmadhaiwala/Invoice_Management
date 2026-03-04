"use client";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import LoginPage from "../login/page";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated: show app with Navbar
  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Navbar />
      <div className="p-6 w-full overflow-auto">
        {children}
      </div>
    </div>
  );
}
