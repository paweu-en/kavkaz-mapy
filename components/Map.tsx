// import * as m from "motion/react-m";
import {} from "motion";
import { useEffect, useRef, useState } from "react";
import mapboxgl, {
  Map as MapboxMap,
  LngLatBounds,
  // MapSourceDataEvent,
} from "mapbox-gl";
import useDebouncedResize from "@/hooks/useResize";
// import { AnimatePresence } from "motion/react";
// import { Fjalla_One } from "next/font/google";
// import { AnimatePresence } from "motion/react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

// Kluczowe punkty do wyświetlenia

// const fjallaOne = Fjalla_One({ weight: "400", subsets: ["latin"] });

const Map = ({ locations }: MapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const skeletonRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [lockMap, setLockMap] = useState(false);
  const [initialMapSize, setInitialMapSize] = useState(0);
  const [expandedMapSize, setExpandedMapSize] = useState(0);
  // const [nextElementHeight, setNextElementHeight] = useState(0);
  // const nextElement = containerRef.current?.nextSibling;

  // useEffect(() => {
  //   if (nextElement instanceof HTMLElement && lockMap) {
  //     nextElement.setAttribute("style", `top: ${nextElementHeight}px`);
  //   }

  //   if (nextElement instanceof HTMLElement && !lockMap) {
  //     nextElement.removeAttribute("style");
  //   }
  // }, [lockMap]);

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
  }, []);

  const resizeMap = () => {
    console.log("RESIZE");

    containerRef.current?.scrollIntoView({
      behavior: "instant",
    });
    if (!map.current) return;
    map.current.resize();

    setTimeout(() => {
      resetToAllPoints();
    }, 250);
  };

  const { width, height } = useDebouncedResize(resizeMap, 250);
  console.log(width, height);

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

  return (
    <>
      <div
        ref={containerRef}
        id='map'
        className='map absolute w-full flex flex-col p-2 py-8 gap-x-4 gap-y-6 z-[999] h-[inherit]'>
        {/* Panel sterowania */}
        <div
          ref={buttonsRef}
          className='w-full flex gap-x-2 h-min flex-wrap gap-2 justify-center'>
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
        {/* Mapa */}
        {/* ZMIANA SZEROKOSCI MAPY TO TUTAJ - className w-1/3 i clipPath 66.6% */}
        <div
          ref={maskRef}
          id='map-container'
          // className={`w-1/2 h-full relative`}
          className={`w-full h-full relative`}
          style={{
            width: lockMap ? "100%" : undefined,
            // clipPath: `inset(0 50% ${
            clipPath: `inset(0 0 ${
              lockMap &&
              expandedMapSize &&
              expandedMapSize - initialMapSize + "px"
            } 0 round 6px)`,
          }}>
          {/* Skeleton - wyświetlany przed załadowaniem mapy */}
          <div
            ref={skeletonRef}
            id='map-skeleton'
            className={`TUTAJ SKELETON map-skeleton relative h-full rounded-md bg-[#82817e] z-50 ${
              isMapLoaded ? "is-loaded" : ""
            } ${lockMap ? "is-locked" : ""}`}
            onClick={() => {
              // setNextElementHeight(containerRef.current?.offsetHeight || 0);
              setInitialMapSize(
                skeletonRef.current?.getBoundingClientRect().height || 0
              );
              console.log(
                "PRZED: ",
                skeletonRef.current?.getBoundingClientRect().height
              );
              setLockMap(true);
              containerRef.current?.classList.add("map-mode");
              backgroundRef.current?.setAttribute(
                "style",
                "background-color: #2c2c2b; transition-delay: 0s"
              );
              containerRef.current?.scrollIntoView({
                behavior: "smooth",
              });

              setTimeout(() => {
                resetToAllPoints();
                if (!map.current) return;
                map.current.resize();
              }, 250);
              setTimeout(() => resetToAllPoints(), 500);
              setTimeout(() => {
                maskRef.current?.classList.add("mask-hidden");
              }, 250);

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
              containerRef.current?.removeAttribute("style");
              backgroundRef.current?.removeAttribute("style");
              maskRef.current?.removeAttribute("style");
              setInitialMapSize(0);
              setExpandedMapSize(0);
              setLockMap(false);

              setTimeout(() => {
                containerRef.current?.classList.remove("map-mode");
              }, 500);
              setTimeout(() => {
                maskRef.current?.classList.remove("mask-hidden");
                resetToAllPoints();
                if (!map.current) return;
                map.current.resize();
              }, 1050);
              // }, 1500);

              setTimeout(() => {
                resetToAllPoints();
              }, 1100);
              // }, 1550);
            }}></div>
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
        {/* <div className='text-[4vw] p-2 flex-1 left-1/2 absolute'>
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
          TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
          TEST TEST TEST TEST
        </div> */}
        <div
          ref={backgroundRef}
          className='TEST absolute left-0 z-[-2] w-full h-[100vh] origin-center scale-y-150'
        />
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
