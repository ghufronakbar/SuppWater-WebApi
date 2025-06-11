import { useState } from "react";
import api from "@/config/api";
import { AuthResponse, Api } from "@/models/Api";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { APP_NAME } from "@/constants";

interface LoginDTO {
  email: string;
  password: string;
}

const initLoginDTO: LoginDTO = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const [form, setForm] = useState<LoginDTO>(initLoginDTO);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data } = await api.post<Api<AuthResponse>>("/login", {
        email: form.email,
        password: form.password,
      });
      Cookies.set(APP_NAME, data.data.accessToken);

      if (data.data.role === "Admin") {
        router.push("/admin/dashboard");
      } else if (data.data.role === "Seller") {
        router.push("/seller/dashboard");
      } else {
        console.log("Role not found");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error);
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center"></div>
  );
};

export default LoginPage;
