import dynamic from "next/dynamic";
import Head from "next/head";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Mapa 3D - Kazbek i okolice</title>
        <meta
          name='description'
          content='Interaktywna mapa 3D Kazbeku i okolic w Gruzji'
        />
      </Head>
      <main
        className='w-full overflow-hidden'
        // style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      >
        {/* <div className=''> */}
        <Map />
        {/* </div> */}
      </main>
    </>
  );
}
