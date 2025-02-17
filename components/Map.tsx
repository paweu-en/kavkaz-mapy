"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map as MapboxMap, LngLatBounds } from "mapbox-gl";
// import { GeoJSON } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

type Location = {
  name: string;
  coords: [number, number];
};

// Kluczowe punkty do wyświetlenia
const locations: Location[] = [
  { name: "Kazbek", coords: [44.977, 42.6954] },
  { name: "Stepantsminda", coords: [44.6442, 42.6561] },
  { name: "Gergeti Monastery", coords: [44.609, 42.664] },
  { name: "Gudauri", coords: [44.4828, 42.4771] },
  { name: "Tbilisi", coords: [44.8271, 41.7151] },
  // { name: "Poznań", coords: [16.9252, 52.4064] },
];

const Map = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapboxMap | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Czy mapa jest w pełni załadowana?

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [44.977, 42.6954],
      zoom: 3,
      pitch: 0,
      bearing: 0,
    });

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
          if (!e.features || e.features.length === 0) return;

          const geometry = e.features[0].geometry as GeoJSON.Point;
          const coordinates = geometry.coordinates as [number, number]; // 👈 Rzutowanie na krotkę

          flyToLocation(coordinates);
        });
      }
    });

    const resizeMap = () => {
      if (map.current) {
        map.current.resize();
      }
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

  return (
    <div
      className='flex-col lg:flex-row-reverse h-screen'
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        display: "flex",
      }}>
      {/* Panel sterowania */}
      <div
        className='w-full lg:w-1/2'
        style={{
          // position: "absolute",
          // width: "50%",
          // top: "10px",
          // left: "50%",
          // transform: "translateX(-50%)",
          // background: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          // margin: "10px 0",
          // borderRadius: "9999px",
          // boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
          // display: "flex",
          // gap: "10px",
          // zIndex: 10,
        }}>
        <button
          onClick={resetToAllPoints}
          className='bg-[#82817e] hover:bg-[#2c2c2b] text-white py-2 m-2 px-6 rounded-full transition-all'>
          Wszystkie punkty
        </button>
        {locations.map((location) => (
          <button
            key={location.name}
            onClick={() => flyToLocation(location.coords)}
            className='bg-[#82817e] hover:bg-[#2c2c2b]'
            style={{
              padding: "8px 12px",
              margin: "8px",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              // backgroundColor: "",
              color: "#fff",
              transition: "0.3s",
              // fontWeight: "medium",
            }}>
            {location.name}
          </button>
        ))}
      </div>

      {/* Mapa */}

      {/* Skeleton - wyświetlany przed załadowaniem mapy */}
      {isMapLoaded ? (
        <div
          className='w-full lg:w-1/2'
          style={{
            position: "relative",
            // width: "100%",
            height: "100%",
            background: "#2c2c2b",
            animation: "pulse 2s infinite",
            zIndex: "10",
          }}
        />
      ) : (
        <div
          ref={mapContainer}
          className='w-full lg:w-1/2'
          style={{
            // width: "50%",
            height: "100%",
            overflow: "hidden",
            visibility: isMapLoaded ? "visible" : "hidden", // Ukrycie mapy do czasu załadowania
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.95;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Map;
