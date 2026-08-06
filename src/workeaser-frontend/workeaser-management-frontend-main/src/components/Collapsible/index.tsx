import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Container } from "./styles";

interface Rect {
  height: number;
}

interface CollapsibleProps {
  children: ReactNode;
  collapse: boolean;
}
export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  collapse,
}) => {
  const childrenRef = useRef(null);

  const [childrenHeight, setChildrenHeight] = useState<number>();

  useEffect(() => {
    if (childrenRef.current) {
      const interval = setInterval(() => {
        const rect: Rect = childrenRef.current.getBoundingClientRect();
        setChildrenHeight(rect.height);
      }, 20);
      setTimeout(() => {
        clearInterval(interval);
      }, 220);
    }
  }, [children]);

  return (
    <Container childrenHeight={childrenHeight} collapse={collapse}>
      <div ref={childrenRef}>{children}</div>
    </Container>
  );
};
