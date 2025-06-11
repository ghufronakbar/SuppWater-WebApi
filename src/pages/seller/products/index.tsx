import { useEffect, useState } from "react";
import SellerLayout from "@/components/layouts/SellerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { Product, User } from "@prisma/client";
import formatRupiah from "@/utils/format/formatRupiah";
import formatDate from "@/utils/format/formatDate";
import { FiPlus, FiMoreVertical, FiEdit, FiTrash2 } from "react-icons/fi";
import { SellerLoading } from "@/components/layouts/loading/SellerLoading";
import { AxiosError } from "axios";
import Image from "next/image";
import { Api } from "@/models/Api";
import { UploadApiResponse } from "cloudinary";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ProductWithUser extends Product {
  user: User;
}

interface ProductForm {
  name: string;
  desc: string;
  price: number;
  images: string[];
}

const SellerProductsPage = () => {
  const [products, setProducts] = useState<ProductWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    desc: "",
    price: 0,
    images: [],
  });
  const [imageTemp, setImageTemp] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/seller/products");
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

  // -------- Tambah Produk --------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editMode && editingId) {
        // Edit
        await api.put(`/seller/products/${editingId}`, form);
        toast({
          title: "Berhasil",
          description: "Produk berhasil diperbarui",
        });
      } else {
        // Tambah baru
        await api.post("/seller/products", form);
        toast({
          title: "Berhasil",
          description: "Produk berhasil dibuat",
        });
      }
      setShowForm(false);
      setEditMode(false);
      setForm({ name: "", desc: "", price: 0, images: [] });
      setImageTemp(null);
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Kesalahan",
          description:
            error.response?.data?.message || "Gagal memproses produk",
          variant: "destructive",
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  // -------- Upload Gambar --------
  const addImage = async () => {
    try {
      if (imageTemp) {
        toast({
          title: "Loading",
          description: "Mengunggah gambar...",
        });
        const formData = new FormData();
        formData.append("image", imageTemp);

        const response = await api.post<Api<UploadApiResponse>>(
          "/image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.data.secure_url) {
          setForm((prev) => ({
            ...prev,
            images: [...prev.images, response.data.data.secure_url],
          }));
        }
        setImageTemp(null);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Kesalahan",
          description:
            error.response?.data?.message || "Gagal mengupload gambar",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // -------- Edit Produk --------
  const handleEdit = (product: ProductWithUser) => {
    setShowForm(true);
    setEditMode(true);
    setEditingId(product.id);
    setForm({
      name: product.name,
      desc: product.desc,
      price: product.price,
      images: product.images,
    });
    setImageTemp(null);
  };

  // -------- Delete Produk --------
  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/seller/products/${deletingId}`);
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
      setShowDeleteDialog(false);
      setDeletingId(null);
      fetchProducts();
    } catch (error) {
      console.log(error);
      toast({
        title: "Kesalahan",
        description: "Gagal menghapus produk",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <SellerLoading />;
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produk Saya</h1>
            <p className="text-gray-600">Kelola katalog produk Anda</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
              setEditingId(null);
              setForm({ name: "", desc: "", price: 0, images: [] });
            }}
          >
            <FiPlus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editMode ? "Edit Produk" : "Tambah Produk Baru"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Harga (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          price: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Deskripsi</Label>
                  <textarea
                    id="desc"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form.desc}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, desc: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gambar Produk</Label>
                  <div className="flex flex-col space-y-2">
                    <Input
                      onChange={(e) =>
                        setImageTemp(e.target?.files?.[0] || null)
                      }
                      type="file"
                      className="hidden"
                      id="image"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        document.getElementById("image")?.click();
                      }}
                      className="w-fit"
                    >
                      Pilih Gambar
                    </Button>
                    {imageTemp && (
                      <div className="flex flex-col justify-end items-end gap-4 w-fit">
                        <div className="border border-dashed p-4">
                          <Image
                            src={URL.createObjectURL(imageTemp)}
                            width={400}
                            height={400}
                            alt=""
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addImage}
                          className="w-fit"
                        >
                          Tambah
                        </Button>
                      </div>
                    )}
                  </div>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {form.images.map((img, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={img}
                            alt={`Produk ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                            width={400}
                            height={400}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={formLoading}>
                    {formLoading
                      ? editMode
                        ? "Menyimpan..."
                        : "Membuat..."
                      : editMode
                      ? "Simpan Perubahan"
                      : "Buat Produk"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditMode(false);
                      setEditingId(null);
                      setForm({ name: "", desc: "", price: 0, images: [] });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk Anda ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-3 relative"
                >
                  {/* Dropdown Titik Tiga */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full"
                        >
                          <FiMoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <FiEdit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setShowDeleteDialog(true);
                            setDeletingId(product.id);
                          }}
                          className="text-red-600"
                        >
                          <FiTrash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {product.images.length > 0 && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      width={400}
                      height={400}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.desc}
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      {formatRupiah(product.price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dibuat: {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada produk ditemukan. Buat produk pertamamu!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Konfirmasi Hapus */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
                dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingId(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SellerLayout>
  );
};

export default SellerProductsPage;
