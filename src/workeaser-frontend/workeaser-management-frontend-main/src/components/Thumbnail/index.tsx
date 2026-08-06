import React from "react";
import Image from "next/legacy/image";
import { Figure, Preview } from "./styles";
import { api } from "@services/api";

interface ThumbnailProps {
  url?: string;
  fullUrl?: string;
  alt: string;
  size: number;
  radius?: number;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({
  url,
  fullUrl,
  alt,
  size,
  radius,
}) => (
  <Figure size={size} radius={radius}>
    {url || fullUrl ? (
      <Image
        src={fullUrl ?? `${api.defaults.baseURL}/photos/${url}`}
        width={size}
        height={size}
        alt={alt}
        objectFit="cover"
        objectPosition="center"
      />
    ) : (
      <Preview size={size} radius={radius} />
    )}
  </Figure>
);
