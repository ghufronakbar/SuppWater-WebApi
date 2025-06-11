import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { Product, User } from "@prisma/client";
import formatRupiah from "@/utils/format/formatRupiah";
import formatDate from "@/utils/format/formatDate";
import { AdminLoading } from "@/components/layouts/loading/AdminLoading";
import Image from "next/image";

interface ProductWithUser extends Product {
  user: User;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<ProductWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/products");
      setProducts(data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data produk",
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
          <h1 className="text-3xl font-bold text-gray-900">Produk Terdaftar</h1>
          <p className="text-gray-600">Produk didaftarkan dari penjual</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semua Produk ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Produk</th>
                    <th className="text-left py-3 px-4">Harga</th>
                    <th className="text-left py-3 px-4">Penjual</th>
                    <th className="text-left py-3 px-4">Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                Tidak Ada Gambar
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {product.desc}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-green-600">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {product.user.picture ? (
                            <Image
                              src={product.user.picture}
                              alt={product.user.name}
                              className="w-6 h-6 rounded-full"
                              width={400}
                              height={400}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                              {product.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm">{product.user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(product.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada produk ditemukan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
