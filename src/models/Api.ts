import { User } from "@prisma/client";
import { AxiosError, AxiosResponse } from "axios";

export interface Api<T = undefined> {
  message: string;
  data: T;
}

export interface ResErr extends AxiosError {
  response?: AxiosResponse<Api>;
}

export interface AuthResponse extends User {
  accessToken: string;
}
