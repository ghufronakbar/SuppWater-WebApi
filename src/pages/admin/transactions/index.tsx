import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { Transaction, User } from "@prisma/client";
import formatRupiah from "@/utils/format/formatRupiah";
import formatDate from "@/utils/format/formatDate";
import { AdminLoading } from "@/components/layouts/loading/AdminLoading";

interface TransactionWithUser extends Transaction {
  user: User;
}

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/transactions");
      setTransactions(data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data transaksi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Pemasukan":
        return "bg-green-100 text-green-800";
      case "Pencairan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <AdminLoading />;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Transaksi
          </h1>
          <p className="text-gray-600">Pantau semua transaksi keuangan</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Transaksi ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID Transaksi</th>
                    <th className="text-left py-3 px-4">Pengguna</th>
                    <th className="text-left py-3 px-4">Jumlah</th>
                    <th className="text-left py-3 px-4">Tipe</th>
                    <th className="text-left py-3 px-4">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-mono text-sm">
                        {transaction.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {transaction.user.picture ? (
                            <img
                              src={transaction.user.picture}
                              alt={transaction.user.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                              {transaction.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm">
                            {transaction.user.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <span
                          className={
                            transaction.type === "Pemasukan"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.type === "Pemasukan" ? "+" : "-"}
                          {formatRupiah(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada transaksi ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminTransactionsPage;
