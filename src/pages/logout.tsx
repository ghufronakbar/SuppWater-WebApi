import { useRouter } from "next/router";
import { useEffect } from "react";
import Cookies from "js-cookie";

const LogoutPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      Cookies.remove("accessToken");
      router.push("/login");
    }
  }, [router]);
  return null;
};

export default LogoutPage;
