// import * as m from "motion/react";
// import { motion as m, AnimatePresence } from "motion/react";
// import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

function NavbarTest() {
  // const [isOn, setIsOn] = useState(false);

  return (
    <>
      {/* <div className='sticky h-6 -top-6 w-full bg-[#2c2c2b] text-[#e4e2dd] flex justify-between items-baseline px-2'>
        <div className='flex gap-4'>
          <div>Facebook</div>
          <div>Instagram</div>
        </div>
        <div className='flex gap-4'>
          <div>+995 558 154 189</div>
          <div>hello@kavkazbrothers.com</div>
        </div>
      </div> */}
      <header
        // onClick={() => setIsOn((prev) => !prev)}
        className='sticky top-0 w-full h-8 lg:h-10 bg-[#2c2c2b] flex items-center justify-between px-2 text-[#e4e2dd] transition-all z-[9999]'>
        {/* <div className='w-full absolute top-0'>
          <div className='sticky -top-5 w-full h-5 bg-red-500'></div>
        </div> */}
        {/* <AnimatePresence initial={false} mode='popLayout'> */}
        {/* {isOn && ( */}
        <div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // exit={{ opacity: 0 }}
          // transition={{ duration: 0.3 }}>
          // layout
          className='h-4 lg:h-[18px] transition-all'
          // style={{ display: isOn ? "block" : "none" }}
        >
          <Logo />
        </div>
        {/* )} */}
        {/* </AnimatePresence> */}
        <div
          className='flex w-1/2 justify-between lg:text-[18px] transition-all duration-300'
          // layout
          // transition={{ duration: 0.5, delay: 0.1 }}
          // style={{ width: isOn ? "" : "100%" }}
        >
          <Link href='/'>Katalog</Link>
          <Link href='/'>Dziennik</Link>
          <Link href='/'>O Nas</Link>
        </div>
      </header>
    </>
  );
}
export default NavbarTest;
