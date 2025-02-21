import * as m from "motion/react-m";
import {} from "motion";
import { useEffect, useRef, useState } from "react";
import mapboxgl, {
  Map as MapboxMap,
  LngLatBounds,
  // MapSourceDataEvent,
} from "mapbox-gl";
// import { Fjalla_One } from "next/font/google";
// import { AnimatePresence } from "motion/react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

// Kluczowe punkty do wyświetlenia

// const fjallaOne = Fjalla_One({ weight: "400", subsets: ["latin"] });

const Map = ({ locations }: MapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const skeletonRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [lockMap, setLockMap] = useState(false);
  // const animationFrameId = useRef<number | null>(null);
  const [initialMapSize, setInitialMapSize] = useState(0);
  const [expandedMapSize, setExpandedMapSize] = useState(0);
  // Czy mapa jest w pełni załadowana?

  useEffect(() => {
    if (map.current || !mapRef.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      // center: [44.977, 42.6954],
      center: [15, 50],
      zoom: 1,
      pitch: 0,
      bearing: 0,
    });

    // const nav = new mapboxgl.NavigationControl();
    // map.current.addControl(nav, "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      setIsMapLoaded(true); // ✅ Mapa jest gotowa!

      map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      map.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });

      if (!map.current.getSource("points")) {
        map.current.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: locations.map((location) => ({
              type: "Feature",
              properties: { name: location.name },
              geometry: { type: "Point", coordinates: location.coords },
            })),
          },
        });

        map.current.addLayer({
          id: "points",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": 6,
            "circle-color": "#ff0000", // 🔴 Punkty zawsze czerwone
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
            "circle-color-transition": { duration: 1000 }, // 🌟 Dodanie transition
          },
        });

        setTimeout(() => {
          animateMapToBounds();
        }, 1000);

        // Kliknięcie w punkt przenosi kamerę
        map.current.on("click", "points", (e) => {
          // e.preventDefault();
          if (!e.features || e.features.length === 0) return;

          const geometry = e.features[0].geometry as GeoJSON.Point;
          const coordinates = geometry.coordinates as [number, number]; // 👈 Rzutowanie na krotkę

          flyToLocation(coordinates);
        });
      }
    });

    const resizeMap = () => {
      console.log("RESIZE");
      if (map.current) {
        map.current.resize();
      }
      // window.dispatchEvent(new Event("resize"));
      setTimeout(() => resetToAllPoints(), 500);
    };

    window.addEventListener("resize", resizeMap);
    return () => window.removeEventListener("resize", resizeMap);
  }, []);

  const flyToLocation = (coords: [number, number]) => {
    if (!map.current) return;

    map.current.flyTo({
      center: coords,
      zoom: 12,
      pitch: 60,
      bearing: 30,
      duration: 2000,
      easing: (t) => t * (2 - t),
    });
  };

  const resetToAllPoints = () => {
    if (!map.current) return;
    animateMapToBounds();
  };

  const animateMapToBounds = () => {
    if (!map.current) return;

    const bounds = new LngLatBounds();
    locations.forEach((loc) => bounds.extend(loc.coords));

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12,
      duration: 3000,
      easing: (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    });
  };

  // useEffect(() => {
  //   console.log(skeletonRef.current?.getBoundingClientRect().height);
  // });

  return (
    <>
      <div
        ref={containerRef}
        id='map'
        className='map relative w-full flex flex-col p-2 py-8 gap-x-4 gap-y-6 z-[999]'>
        {/* Panel sterowania */}
        <div className='w-full flex gap-x-2 h-max flex-wrap gap-2 justify-center'>
          <button
            onClick={resetToAllPoints}
            className='bg-[#82817e] hover:bg-[#2c2c2b] text-white py-2 px-3 rounded-full transition-all'>
            Wszystkie punkty
          </button>
          {locations.map((location) => (
            <button
              key={location.name}
              onClick={() => flyToLocation(location.coords)}
              className='bg-[#82817e] hover:bg-[#2c2c2b]'
              style={{
                padding: "8px 12px",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                transition: "0.3s",
              }}>
              {location.name}
            </button>
          ))}
        </div>

        {/* <AnimatePresence>
        {lockMap && ( */}
        {/* <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='TEST absolute z-[99] bg-red-500 inset-0 scale-150'
      /> */}
        {/* )}
      </AnimatePresence> */}

        {/* Mapa */}

        <div
          ref={maskRef}
          id='map-container'
          className={`w-full h-full relative origin-bottom translate-y-0`}
          style={{
            clipPath: `inset(0 0 ${
              lockMap &&
              expandedMapSize &&
              expandedMapSize - initialMapSize + "px"
            } 0 round 6px)`,
          }}>
          {/* <m.div
          // initial={{ opacity: 1 }}
          // animate={{ opacity: lockMap ? 0 : 1 }}
          // transition={{ duration: 1, ease: "easeInOut" }}
          style={{ clipPath: "inset(0 0 0 0)" }}
          className='CLIP_PATH absolute top-0 bg-[#ff000067] w-full h-full z-[99]'
          onAnimationComplete={() => console.log("Animacja zakończona!")}
          onClick={() => console.log("Kliknięto motion.div")}>
          {lockMap}
        </m.div> */}
          <m.div
            // initial={{ opacity: lockMap ? 0 : 1 }}
            // animate={{ opacity: lockMap ? 1 : 0 }}
            // transition={{ duration: 1, ease: "easeInOut" }}
            // className='absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-transparent to-[rgb(44,44,43)]'
            id='map-mask'
            className='CLIP_PATH absolute w-full bg-[#2c2c2b] z-20 pointer-events-none clip-mask origin-bottom translate-y-0'
            style={{
              top: initialMapSize + "px",
              height: expandedMapSize - initialMapSize + "px",
            }}
            // style={{ clipPath: "inset(0 0 0 0 round 0 0 6px 6px)" }}
            // style={{
            //   background: lockMap
            //     ? "linear-gradient(to bottom, transparent 0%, rgb(44,44,43))"
            //     : "linear-gradient(to bottom, transparent 100%, rgb(44,44,43))",
            //   opacity: lockMap ? 0 : 1,
            //   transition: "opacity 1.5s ease-in-out",
            //   height: "100%",
            // }}
          />
          {/* Skeleton - wyświetlany przed załadowaniem mapy */}
          <div
            ref={skeletonRef}
            id='map-skeleton'
            className={`TUTAJ SKELETON map-skeleton relative h-full rounded-md bg-[#82817e] z-50 ${
              isMapLoaded ? "is-loaded" : ""
            } ${lockMap ? "is-locked" : ""}`}
            onClick={() => {
              setInitialMapSize(
                skeletonRef.current?.getBoundingClientRect().height || 0
              );
              console.log(
                "PRZED: ",
                skeletonRef.current?.getBoundingClientRect().height
              );
              setLockMap(true);
              containerRef.current?.classList.add("map-mode");
              // containerRef.current?.setAttribute(
              //   "style",
              //   "background-color: #2c2c2b"
              // );
              backgroundRef.current?.setAttribute(
                "style",
                "background-color: #2c2c2b"
              );
              containerRef.current?.scrollIntoView({
                behavior: "smooth",
                // block: "start",
                // inline: "start",
              });

              resetToAllPoints();

              setTimeout(() => {
                window.dispatchEvent(new Event("resize"));
                // resetToAllPoints();
              }, 650);
              setTimeout(() => resetToAllPoints(), 750);
              console.log(
                "PO: ",
                skeletonRef.current?.getBoundingClientRect().height
              );
              setExpandedMapSize(
                skeletonRef.current?.getBoundingClientRect().height || 0
              );
            }}
            style={{ animation: "pulse 2s infinite" }}
          />
          <div
            ref={mapRef}
            // className='w-full lg:w-1/2'
            className='TUTAJ REF=MAPCONTAINER absolute inset-0 w-full h-full rounded-md overflow-hidden transition-all duration-500 ease-in-out'
            onClick={() => {
              // console.log(
              //   "PRZED: ",
              //   skeletonRef.current?.getBoundingClientRect().height
              // );
              containerRef.current?.removeAttribute("style");
              backgroundRef.current?.removeAttribute("style");
              maskRef.current?.removeAttribute("style");
              setInitialMapSize(0);
              setExpandedMapSize(0);
              resetToAllPoints();
              containerRef.current?.classList.remove("map-mode");
              setLockMap(false);
              window.dispatchEvent(new Event("resize"));
              setTimeout(() => resetToAllPoints(), 100);
              // console.log(
              //   "PO: ",
              //   skeletonRef.current?.getBoundingClientRect().height
              // );
            }}
            style={
              {
                // height: "754px",
                // position: "absolute",
                // inset: 0,
                // width: "100%",
                // height: "100%",
                // margin: "8px",
                // borderRadius: "6px",
                // overflow: "hidden",
                // visibility: isMapLoaded ? "visible" : "hidden", // Ukrycie mapy do czasu załadowania
                // transition: "",
              }
            }></div>
          {/* <button
          onClick={() => console.log("klik")}
          className={`${fjallaOne.className} mx-auto absolute top-2 left-4 right-4 uppercase text-[#e4e2dd] bg-[#2c2c2b] text-base z-[99] transition-opacity delay-1000 rounded-md`}
          style={{ opacity: isMapLoaded ? "opacity: 1" : "opacity: 0" }}>
          <span>
            &#91;&nbsp;&nbsp;{!lockMap ? "włącz tryb mapy" : "wyłącz tryb mapy"}
            &nbsp;&nbsp;&#93;
          </span>
        </button> */}
        </div>

        <style jsx>{`
          /* .mapboxgl-control-container {
          position: absolute;
        }

        @keyframes pulse {
          0% {
            background-color: #82817e;
          }
          50% {
            background-color: #a6a6a6;
          }
          100% {
            background-color: #82817e;
          }
        } */
        `}</style>
        {/* <AnimatePresence mode='wait' initial={false}>
        {lockMap ? ( */}
        <div
          // transition={{ duration: 0.5, ease: "easeInOut" }}
          ref={backgroundRef}
          className='TEST absolute left-0 z-[-1] w-full h-[100vh] origin-center scale-y-150'
        />
        {/* ) : null}
      </AnimatePresence> */}
      </div>
    </>
  );
};

export default Map;

type MapProps = {
  locations: Location[];
};

type Location = {
  name: string;
  coords: [number, number];
};
