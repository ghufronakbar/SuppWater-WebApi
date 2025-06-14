import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@prisma/client";
import formatDate from "@/utils/format/formatDate";
import { AdminLoading } from "@/components/layouts/loading/AdminLoading";
import Image from "next/image";

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users");
      setUsers(data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            Pengguna Terdaftar
          </h1>
          <p className="text-gray-600">Seluruh pengguna terdaftar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Pengguna ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nama</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Peran</th>
                    <th className="text-left py-3 px-4">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {user.picture ? (
                            <Image
                              src={user.picture}
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "Seller"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role === "Seller" ? "Penjual" : "Pengguna"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada pengguna ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
