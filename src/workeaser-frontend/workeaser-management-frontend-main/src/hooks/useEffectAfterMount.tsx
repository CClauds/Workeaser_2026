import { useRef } from "react";
import { useEffect } from "react";

export const useEffectAfterMount = (cb: () => void, dependencies) => {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) {
      return cb();
    }
  }, [...dependencies, cb]);
};
