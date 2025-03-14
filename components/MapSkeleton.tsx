import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

export default function Skeleton({ locations }: MapProps) {
  const AllButtons = [{ name: "Wszystkie punkty", coords: [0, 0] }].concat(
    locations
  );

  console.log("ALL BUTTONS: ", AllButtons);

  return (
    <AnimatePresence>
      <m.div
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className='DYNAMIC-SKELETON! container-skeleton relative flex-col flex p-2 py-8 gap-x-4 gap-y-6 gap-4 h-[400px] lg:h-[400px] xl:h-[600px]'>
        <div className='w-full h-min text-white flex flex-wrap gap-2 justify-center'>
          {AllButtons.map((location) => (
            <button
              key={location.name}
              className='bg-[#82817e] hover:bg-[#2c2c2b]'
              style={{
                padding: "8px 12px",
                // marginRight: "8px",
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
        <div
          className='bg-[#82817e] w-full h-full text-white rounded-md'
          style={{ animation: "pulse 2s infinite" }}
        />
      </m.div>
    </AnimatePresence>
  );
}

type MapProps = {
  locations: Location[];
};

type Location = {
  name: string;
  coords: [number, number];
};
