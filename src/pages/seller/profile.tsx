import { ChangeEvent, useEffect, useState } from "react";
import SellerLayout from "@/components/layouts/SellerLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/config/api";
import { useAuth, UserWithToken } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Trash } from "lucide-react";
import { FiUsers } from "react-icons/fi";
import { Api } from "@/models/Api";
import { UploadApiResponse } from "cloudinary";
import { AxiosError } from "axios";

interface ProfileDTO {
  name: string;
  email: string;
  picture: string | null;
}

const SellerProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileDTO>({
    name: "",
    email: "",
    picture: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        picture: user.picture || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put<Api<UserWithToken>>(
        "/seller/account",
        profile
      );
      toast({ title: "Berhasil", description: data.message });
      await updateUser(data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Gagal",
        description: error?.response?.data?.message || "Gagal update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    try {
      const { data } = await api.patch("/seller/account", passwords);
      toast({ title: "Berhasil", description: data.message });
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: "Gagal",
        description: error?.response?.data?.message || "Gagal ganti password",
        variant: "destructive",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const handlePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target?.files?.[0]) {
        toast({
          title: "Loading",
          description: "Mengunggah gambar...",
        });
        const formData = new FormData();
        formData.append("image", e.target.files[0]);

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
          setProfile({ ...profile, picture: response.data.data.secure_url });
        }
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast({
          title: "Gagal",
          description:
            error?.response?.data?.message ||
            "Terjadi kesalahan saat mengunggah gambar",
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Gagal",
          description:
            error?.message || "Terjadi kesalahan saat mengunggah gambar",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat mengunggah gambar",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <SellerLayout>
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Profil Seller</h1>
        <div className="flex flex-col md:flex-row w-full gap-8">
          <div className="flex flex-col w-full md:w-1/2 lg:w-2/3 gap-4">
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-4 bg-white p-6 rounded shadow"
            >
              <h2 className="font-semibold text-lg mb-2">Edit Profil</h2>
              {profile.picture ? (
                <Image
                  src={profile.picture}
                  alt=""
                  width={400}
                  height={400}
                  className="w-40 h-40 object-cover rounded-full mx-auto"
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-primary flex items-center justify-center mx-auto">
                  <FiUsers className="h-20 w-20 text-white" />
                </div>
              )}
              <div className="flex flex-row gap-2 mx-auto items-center justify-center">
                <Input
                  // onClick={() => {
                  //   console.log("hit");
                  //   const element = document.getElementById("picture");
                  //   console.log(element);
                  //   element?.click();
                  // }}
                  onChange={handlePictureChange}
                  type="file"
                  placeholder="Ganti Foto"
                />

                {profile.picture && (
                  <Button
                    variant={"destructive"}
                    onClick={() => {
                      setProfile({ ...profile, picture: null });
                    }}
                  >
                    <Trash />
                    Hapus Foto
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  name="name"
                  id="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  required
                  type="email"
                />
              </div>
              <div className="space-y-2 hidden">
                <Label htmlFor="picture">Foto</Label>
                <Input
                  id="picture"
                  // value={profile.picture}
                  onChange={handlePictureChange}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </div>
          <div className="flex flex-col w-full md:w-1/2 lg:w-2/3 gap-4">
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4 bg-white p-6 rounded shadow"
            >
              <h2 className="font-semibold text-lg mb-2">Ganti Password</h2>
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Password Lama</Label>
                <Input
                  name="oldPassword"
                  id="oldPassword"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  name="newPassword"
                  id="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  type="password"
                  required
                />
              </div>
              <Button type="submit" disabled={pwLoading} className="w-full">
                {pwLoading ? "Mengganti..." : "Ganti Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
};

export default SellerProfilePage;
