import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { APP_NAME } from "@/constants";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/logo.png" />
        <title>{APP_NAME}</title>
      </Head>
      <div className="font-poppins">
        <Component {...pageProps} />
      </div>
    </>
  );
}
