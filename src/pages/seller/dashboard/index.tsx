import { useEffect, useState } from "react";
import SellerLayout from "@/components/layouts/SellerLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import formatRupiah from "@/utils/format/formatRupiah";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalTransactions: number;
  totalBalance: number;
}

const DashboardSeller = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalTransactions: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [productsRes, ordersRes, transactionsRes] = await Promise.all([
        api.get("/seller/products"),
        api.get("/seller/orders"),
        api.get("/seller/transactions"),
      ]);

      // Calculate balance from transactions
      const transactions = transactionsRes.data.data;
      const balance = transactions.reduce((acc: number, transaction: any) => {
        if (transaction.type === "Pemasukan") {
          return acc + transaction.amount;
        } else {
          return acc - transaction.amount;
        }
      }, 0);

      setStats({
        totalProducts: productsRes.data.data.length,
        totalOrders: ordersRes.data.data.length,
        totalTransactions: transactions.length,
        totalBalance: balance,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "My Products",
      value: stats.totalProducts,
      description: "Active products",
      icon: FiPackage,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      description: "All orders received",
      icon: FiShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Transactions",
      value: stats.totalTransactions,
      description: "Financial transactions",
      icon: FiDollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Balance",
      value: formatRupiah(stats.totalBalance),
      description: "Current balance",
      icon: FiTrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      isAmount: true,
    },
  ];

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome to your seller dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.isAmount ? stat.value : stat.value}
                </div>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
              <CardDescription>Your business performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Products</span>
                  <span className="font-medium">{stats.totalProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-medium">{stats.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <span className="font-medium text-green-600">
                    {formatRupiah(stats.totalBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Add new products to your catalog
                </p>
                <p className="text-sm text-gray-600">
                  • Process incoming orders
                </p>
                <p className="text-sm text-gray-600">
                  • Withdraw your earnings
                </p>
                <p className="text-sm text-gray-600">
                  • Track transaction history
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  );
};

export default DashboardSeller;