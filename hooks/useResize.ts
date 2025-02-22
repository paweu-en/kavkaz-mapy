import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

function useResize(callback?: () => void, delay: number = 200): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function handleResize() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });

        if (callback) {
          callback(); // Wywołuje przekazaną funkcję
        }
      }, delay);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [callback, delay]);

  return windowSize;
}

export default useResize;
