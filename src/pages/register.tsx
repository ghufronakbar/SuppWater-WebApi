import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/config/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { APP_NAME } from "@/constants";
import { AxiosError } from "axios";
import Link from "next/link";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: "Seller";
  bankName: string;
  bankAccount: string;
}

const initRegisterDTO: RegisterDTO = {
  name: "",
  email: "",
  password: "",
  role: "Seller",
  bankName: "",
  bankAccount: "",
};

const INDONESIAN_BANKS = [
  // Bank Konvensional
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "BTN",
  "Permata",
  "Danamon",
  "CIMB Niaga",
  "OCBC NISP",
  "Maybank",
  "Panin Bank",
  "Mega",
  "Sinarmas",
  "Bukopin",
  "Commonwealth",
  // Virtual Account
  "BCA Virtual Account",
  "Mandiri Virtual Account",
  "BNI Virtual Account",
  "BRI Virtual Account",
  "Permata Virtual Account",
  "ShopeePay",
  "OVO",
  "GoPay",
  "DANA",
  "LinkAja",
  "QRIS",
];

const RegisterPage = () => {
  const [form, setForm] = useState<RegisterDTO>(initRegisterDTO);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/register", form);
      toast({
        title: "Berhasil",
        description: "Registrasi berhasil! Silakan login.",
      });
      router.push("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: "Kesalahan",
          description: error.response?.data?.message || "Registrasi gagal",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {APP_NAME}
          </CardTitle>
          <CardDescription>Buat akun Penjual</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src={"/logo.png"}
            alt=""
            width={400}
            height={400}
            className="mx-auto w-40 h-40"
          />
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama"
                value={form.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan kata sandi"
                value={form.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank / E-wallet</Label>
              <Select
                value={form.bankName}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, bankName: val }))
                }
                required
              >
                <SelectTrigger id="bankName" className="w-full">
                  <SelectValue placeholder="Pilih bank atau VA" />
                </SelectTrigger>
                <SelectContent>
                  {INDONESIAN_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Nomor Rekening / Akun</Label>
              <Input
                id="bankAccount"
                name="bankAccount"
                type="text"
                placeholder="Masukkan nomor rekening / akun"
                value={form.bankAccount}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2 hidden">
              <Label htmlFor="role">Peran</Label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hidden"
                required
              >
                <option value="User">Pengguna</option>
                <option value="Seller">Penjual</option>
              </select>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? "Membuat akun..." : "Buat Akun"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Masuk di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
