import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Toaster } from "../ui/toaster";
import { APP_NAME } from "@/constants";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "Admin") {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: FiHome },
    { name: "Pengguna", href: "/admin/users", icon: FiUsers },
    { name: "Produk", href: "/admin/products", icon: FiPackage },
    { name: "Pesanan", href: "/admin/orders", icon: FiShoppingCart },
    { name: "Transaksi", href: "/admin/transactions", icon: FiDollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-primary">{APP_NAME}</h1>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200"
          href={"/admin/profile"}
        >
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              {user.picture ? (
                <Image
                  className="h-8 w-8 rounded-full"
                  src={user.picture}
                  alt={user.name}
                  width={400}
                  height={400}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <FiUser className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
