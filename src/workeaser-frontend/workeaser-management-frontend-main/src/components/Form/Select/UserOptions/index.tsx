import { Icomoon } from "@components/Icomoon";
import { api } from "@services/api";
import { NEW_CLIENT_VALUE } from "@utils/constants";
import Image from "next/image";
import React from "react";
import { Container, Figure, Preview } from "./styles";

interface UserOptionsProps {
  value?: string;
  photo: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  personal_phone: string;
}

export const UserOptions: React.FC<UserOptionsProps> = ({
  value,
  photo,
  first_name,
  last_name,
  company_name,
  email,
  personal_phone,
}) => {
  const Thumbnail = ({ url }) => {
    return (
      <Figure size={36}>
        {url ? (
          <Image
            src={`${api.defaults.baseURL}/photos/${url}`}
            alt="photo"
            width="36"
            height="36"
          />
        ) : (
          <Preview size={36} />
        )}
      </Figure>
    );
  };

  return (
    <Container>
      {value === NEW_CLIENT_VALUE ? (
        <>
          <Figure size={36}>
            <Image
              src={`/images/user-plus.png`}
              alt="photo"
              width={36}
              height={36}
            />
          </Figure>
          <div>
            <h3>Add New Client</h3>
          </div>
        </>
      ) : (
        <>
          <Thumbnail url={photo} />
          <div>
            <h3>
              {first_name} {last_name} - {company_name ?? "Not informed"}
            </h3>
            <h4>
              {email} - {personal_phone ?? "Not informed"}
            </h4>
          </div>
        </>
      )}
    </Container>
  );
};
