import { MutableRefObject, useEffect, useState } from "react";

interface useOutsideClickProps {
  ref: MutableRefObject<any>;
  extraRef?: MutableRefObject<any>;
  callback: () => void;
}

export const useOutsideClick = ({
  ref,
  extraRef,
  callback,
}: useOutsideClickProps) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      let extraCondition = extraRef
        ? !extraRef.current.contains(event.target as Node)
        : true;
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        extraCondition
      ) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
};
