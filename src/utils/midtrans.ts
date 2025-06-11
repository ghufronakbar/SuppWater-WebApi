import {
  MIDTRANS_SERVER_KEY,
  MIDTRANS_URL_API,
  MIDTRANS_URL_API2,
} from "@/constants/midtrans";
import axios, { AxiosError } from "axios";

interface MidtransCheckoutResponse {
  token: string;
  redirect_url: string;
}

interface MidtransCheckResponse {
  status_code?: string;
  transaction_status?: string;
  settlement_time?: string;
}

export const midtransCheck = async (order_id: string) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const { data } = await axios.get<MidtransCheckResponse>(
      MIDTRANS_URL_API2 + "/v2/" + order_id + "/status",
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Midtrans AxiosError:", error.response?.data);
    } else if (error instanceof Error) {
      console.log("Midtrans Error:", error);
    }
    return new Error("MIDTRANS_ERROR");
  }
};

export const midtransCheckout = async (
  order_id: string,
  gross_amount: number
) => {
  try {
    const encodedServerKey = Buffer.from(MIDTRANS_SERVER_KEY + ":").toString(
      "base64"
    );

    const { data } = await axios.post<MidtransCheckoutResponse>(
      MIDTRANS_URL_API + "/snap/v1/transactions",
      {
        transaction_details: {
          order_id,
          gross_amount,
        },
      },
      {
        headers: {
          Authorization: `Basic ${encodedServerKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Midtrans AxiosError:", error.response?.data);
    } else if (error instanceof Error) {
      console.log("Midtrans Error:", error.message);
    }
    return new Error("MIDTRANS_ERROR");
  }
};
