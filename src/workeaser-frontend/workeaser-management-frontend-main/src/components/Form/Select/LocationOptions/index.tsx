import { api } from "@services/api";
import Image from "next/legacy/image";
import React, { useEffect, useRef, useState } from "react";
import { Container, Figure, Preview } from "./styles";

interface LocationOptionsProps {
  photo: string;
  name: string;
  address: string;
}

export const LocationOptions: React.FC<LocationOptionsProps> = ({
  photo,
  name,
  address,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState<number>();

  useEffect(() => {
    const containerWidth = containerRef.current.getBoundingClientRect().width;
    setMaxWidth(containerWidth - 50);
  }, []);

  const Thumbnail = ({ url }) => {
    return (
      <Figure size={36}>
        {url ? (
          <Image
            width={50}
            height={50}
            src={`${api.defaults.baseURL}/photos/${url}`}
            alt="photo"
          />
        ) : (
          <Preview size={36} />
        )}
      </Figure>
    );
  };

  return (
    <Container ref={containerRef} maxWidth={maxWidth}>
      <Thumbnail url={photo} />
      <div>
        <h3>{name}</h3>
        <h4>{address}</h4>
      </div>
    </Container>
  );
};
