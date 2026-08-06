import React from "react";
import { ClientInfo } from "types/cowork/clients";
import { Avatar } from "../Avatar";
import { Icomoon } from "../Icomoon";
import styles from "./styles.module.scss";
import { useFetch } from "@hooks/useFetch";
import { Preview } from "./styles";
import { abbreviateName } from "@utils/helpers";

interface PersonalCardProps {
  clientInfo: ClientInfo;
}

export const PersonalCard: React.FC<PersonalCardProps> = ({ clientInfo }) => {
  // const { data: members } = useFetch(
  //   clientInfo ? `/cowork/clients/${clientInfo.id}/members` : null
  // );

  return (
    <div className={styles.container}>
      <header>
        {clientInfo?.photo ? (
          <Avatar url={clientInfo.photo} alt="avatar" size={60} />
        ) : (
          <Preview size={60}>
            {abbreviateName(
              `${clientInfo?.first_name} ${clientInfo?.middle_name}  ${clientInfo?.last_name}`
            )}
            {/* <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
              <path
                d="M15.379 10.1678C16.936 11.7248 16.936 14.2492 15.379 15.8063C13.822 17.3633 11.2975 17.3633 9.74052 15.8063C8.1835 14.2492 8.1835 11.7248 9.74052 10.1678C11.2975 8.61078 13.822 8.61078 15.379 10.1678"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.5 9V18C21.5 19.105 20.605 20 19.5 20H5.5C4.395 20 3.5 19.105 3.5 18V9C3.5 7.895 4.395 7 5.5 7H7.5L8.962 4.496C9.141 4.189 9.47 4 9.826 4H15.13C15.481 4 15.806 4.184 15.987 4.484L17.5 7H19.5C20.605 7 21.5 7.895 21.5 9Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
          </Preview>
        )}

        <div className={styles.header__infos}>
          <h2>{`${clientInfo?.first_name} ${clientInfo?.middle_name}  ${clientInfo?.last_name}`}</h2>
          <h3>{clientInfo?.company_name}</h3>
        </div>
      </header>

      <div className={styles.infos}>
        <h1>Main Contact Information:</h1>

        <div className={styles.content}>
          <div className={styles.infosRow}>
            <Icomoon iconName="phone2" />
            <p>{clientInfo?.personal_phone ?? "Not informed"}</p>
          </div>
          <div className={styles.infosRow}>
            <Icomoon iconName="at" />
            <p>{clientInfo?.email}</p>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.infosRow}>
          <Icomoon iconName="at" />
          <p>Account Members &amp; Companies:</p>
        </div>
      </div>
    </div>
  );
};
