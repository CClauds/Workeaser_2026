import React from "react";
import Image from "next/legacy/image";
import { Container } from "./styles";

interface SpaceHeaderProps {
  logoUrl: string;
  name: string;
  address: string;
}

export const SpaceHeader: React.FC<SpaceHeaderProps> = ({
  logoUrl,
  name,
  address,
}) => {
  return (
    <Container>
      {logoUrl && (
        <Image
          src={logoUrl}
          width={65}
          height={65}
          alt="coworking logo"
          objectFit="cover"
        />
      )}
      <div>
        <h2>{name}</h2>
        <p>{address}</p>
      </div>
    </Container>
  );
};
