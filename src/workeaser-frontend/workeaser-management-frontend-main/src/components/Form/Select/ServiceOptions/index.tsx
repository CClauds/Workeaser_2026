import { api } from "@services/api";
import Image from "next/legacy/image";
import React from "react";
import { Container, Figure, Preview } from "./styles";

interface ServiceOptionsProps {
  photo: string;
  name: string;
  location: string;
}

export const ServiceOptions: React.FC<ServiceOptionsProps> = ({
  photo,
  name,
  location,
}) => {
  const Thumbnail = ({ url }) => {
    return (
      <Figure size={36}>
        {url ? (
          <Image
            src={`${api.defaults.baseURL}/photos/${url}`}
            height={50}
            width={50}
            alt="photo"
          />
        ) : (
          <Preview size={36} />
        )}
      </Figure>
    );
  };

  return (
    <Container>
      <Thumbnail url={photo} />
      <div>
        <h3>{name}</h3>
        <h4>{location}</h4>
      </div>
    </Container>
  );
};
