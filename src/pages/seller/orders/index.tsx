import { useEffect, useState } from "react";
import SellerLayout from "@/components/layouts/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { Order, User, OrderItem, Product } from "@prisma/client";
import formatRupiah from "@/utils/format/formatRupiah";
import formatDate from "@/utils/format/formatDate";
import { SellerLoading } from "@/components/layouts/loading/SellerLoading";
import Image from "next/image";
import { AxiosError } from "axios";

interface OrderWithDetails extends Order {
  user: User;
  orderItems: (OrderItem & {
    product: Product & {
      user: User;
    };
  })[];
}

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/seller/orders");
      setOrders(data.data);
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal mengambil data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string) => {
    try {
      setLoading(true);
      await api.patch(`/seller/orders/${orderId}`);
      toast({
        title: "Berhasil",
        description: "Pesanan ditandai sebagai dikirim",
      });
      fetchOrders();
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast({
          title: "Kesalahan",
          description:
            error.response?.data?.message || "Gagal memperbarui pesanan",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Dibayar":
        return "bg-blue-100 text-blue-800";
      case "Dikirim":
        return "bg-purple-100 text-purple-800";
      case "Selesai":
        return "bg-green-100 text-green-800";
      case "Dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <SellerLoading />;
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="text-gray-600">Kelola pesanan untuk produk Anda</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pesanan ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Pesanan #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pelanggan: {order.user.name} ({order.user.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        Tanggal: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatRupiah(order.total)}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Detail Pesanan:</h4>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            {item.product.images.length > 0 && (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-12 h-12 rounded object-cover"
                                width={400}
                                height={400}
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} ×{" "}
                                {formatRupiah(item.pricePerItem)}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            {formatRupiah(item.total)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Lokasi Pengantaran:</strong> {order.location}
                    </p>
                    {order.status === "Dibayar" && (
                      <Button
                        onClick={() => updateOrderStatus(order.id)}
                        size="sm"
                      >
                        Tandai sebagai Dikirim
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada pesanan ditemukan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
};

export default SellerOrdersPage;
