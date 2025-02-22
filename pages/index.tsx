import MapSkeleton from "@/components/MapSkeleton";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect } from "react";
// import * as m from "motion/react-m";

const locations: Location[] = [
  { name: "Kazbek", coords: [44.977, 42.6954] },
  { name: "Stepantsminda", coords: [44.6442, 42.6561] },
  { name: "Gergeti Monastery", coords: [44.609, 42.664] },
  { name: "Gudauri", coords: [44.4828, 42.4771] },
  { name: "Tbilisi", coords: [44.8271, 41.7151] },
  // { name: "Poznań", coords: [16.9252, 52.4064] },
];

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => <MapSkeleton locations={locations} />,
});

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  });

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
        className='w-full overflow-hidden bg-[#e4e2dd]'
        // style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      >
        {/* <div className=''> */}
        <div className='w-full text-[8vw] p-2 text-center'>INFO INFO INFO</div>

        <div className=''>
          <div className='relative h-[400px] lg:h-[400px] xl:h-[600px]'>
            <Map locations={locations} />
          </div>
        </div>

        {/* <div className='relative'> */}
        <div className='w-full text-[8vw] p-2 text-center'>
          INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO
          INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO
          INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO
          INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO INFO
        </div>
        <div className='w-full text-[8vw] p-2 text-center'>
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
        </div>
        {/* </div> */}

        {/* </div> */}
      </main>
    </>
  );
}

type Location = {
  name: string;
  coords: [number, number];
};
