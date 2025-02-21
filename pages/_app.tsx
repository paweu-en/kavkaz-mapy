import NavbarTest from "@/components/NavbarTest";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavbarTest />
      <Component {...pageProps} />
    </>
  );
}
