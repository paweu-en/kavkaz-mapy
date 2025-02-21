import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang='en'>
      <Head>{/* <meta name='theme-color' content='#2c2c2b' /> */}</Head>
      <body className='bg-[#e4e2dd] text-[#2c2c2b]'>
        {/* <body className=''> */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
