import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: `/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.log("hitting error");
    if (error?.response && error?.response?.status === 401) {
      console.log("hitting error 401");
      Cookies.remove("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
