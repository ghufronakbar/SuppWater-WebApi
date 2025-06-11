import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiShoppingBag,
} from "react-icons/fi";
import { AdminLoading } from "@/components/layouts/loading/AdminLoading";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { User, Product, Order, Transaction } from "@prisma/client";
import { APP_NAME } from "@/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardData {
  admin: {
    id: string;
    name: string;
    email: string;
    picture: string | null;
    createdAt: string;
  };
  users: Array<User>;
  products: Array<Product>;
  orders: Array<Order>;
  transactions: Array<Transaction>;
  stats: {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalOrders: number;
    totalTransactions: number;
    userRoleCount: Record<string, number>;
    orderStatusCount: Record<string, number>;
  };
  recentOrders: Array<Order>;
  recentTransactions: Array<Transaction>;
}

const DashboardAdmin = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/dashboard");
      setDashboard(data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboard) {
    return <AdminLoading />;
  }

  // Chart Data
  const userRoleLabels = Object.keys(dashboard.stats.userRoleCount);
  const userRoleData = Object.values(dashboard.stats.userRoleCount);
  const userRoleColors = ["#60a5fa", "#facc15"];

  const doughnutData = {
    labels: userRoleLabels,
    datasets: [
      {
        label: "Pengguna & Penjual",
        data: userRoleData,
        backgroundColor: userRoleColors,
        borderWidth: 1,
      },
    ],
  };

  // Bento Info
  const bento = [
    {
      title: "Total Pengguna",
      value: dashboard.stats.totalUsers,
      icon: <FiUsers className="h-6 w-6 text-blue-600" />,
      desc: "Pengguna terdaftar",
    },
    {
      title: "Total Penjual",
      value: dashboard.stats.totalSellers,
      icon: <FiShoppingBag className="h-6 w-6 text-blue-600" />,
      desc: "Penjual terdaftar",
    },
    {
      title: "Total Produk",
      value: dashboard.stats.totalProducts,
      icon: <FiPackage className="h-6 w-6 text-green-600" />,
      desc: "Produk tersedia",
    },
    {
      title: "Total Transaksi",
      value: dashboard.stats.totalTransactions,
      icon: <FiDollarSign className="h-6 w-6 text-orange-600" />,
      desc: "Seluruh transaksi",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Selamat datang di Dashboard Admin {APP_NAME}, {dashboard.admin.name}!
          </p>
        </div>

        {/* Bento Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bento.map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {item.icon}
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <CardDescription>{item.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart & Recent Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Distribusi Pengguna</CardTitle>
              <CardDescription>Perbandingan jumlah pengguna dan penjual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <Doughnut data={doughnutData} />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
              <CardDescription>5 pesanan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Total</th>
                      <th className="text-left py-2 px-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-2 px-2 font-mono">{order.id.slice(0, 8)}...</td>
                        <td className="py-2 px-2">{order.status}</td>
                        <td className="py-2 px-2 text-green-600">{order.total}</td>
                        <td className="py-2 px-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dashboard.recentOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Tidak ada pesanan ditemukan</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>5 transaksi terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Tipe</th>
                      <th className="text-left py-2 px-2">Jumlah</th>
                      <th className="text-left py-2 px-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentTransactions.map((trx) => (
                      <tr key={trx.id} className="border-b">
                        <td className="py-2 px-2 font-mono">{trx.id.slice(0, 8)}...</td>
                        <td className="py-2 px-2">{trx.type}</td>
                        <td className="py-2 px-2 text-blue-600">{trx.amount}</td>
                        <td className="py-2 px-2">{new Date(trx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {dashboard.recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">Tidak ada transaksi ditemukan</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardAdmin;
