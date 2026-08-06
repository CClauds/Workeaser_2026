import { Button } from "../Button";
import { ChatAvatar } from "../Chat/ChatAvatar";
import { Icomoon } from "../Icomoon";
import styles from "./styles.module.scss";
import { formatIsoDate } from "@utils/numberFormat";

interface AppointmentInfoProps {
  title: string;
  name?: string;
  email?: string;
  date?: string;
}

export const AppointmentInfo = ({
  title,
  name,
  email,
  date,
}: AppointmentInfoProps) => {
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <header>
        <div className={styles.title}>
          <ChatAvatar url="" alt="avatar" size={40} />
          <h2>{name}</h2>
        </div>

        <div className={styles.info}>
          <div>
            <p>{email}</p>
            <p>+1 (000) 000-0000</p>
          </div>
        </div>

        <div className={styles.appointment}>
          <div>
            <Icomoon iconName="calendar" />
            <time>{formatIsoDate(date)}</time>
          </div>
          <div>
            <Icomoon iconName="clock" />
            <time>12:00 to 01:15 PM</time>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        <div>
          <h3>Units to be visited:</h3>
          <ol>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
          </ol>
        </div>
        <div className={styles.services}>
          <h3>Interest in:</h3>
        </div>
        <div>
          <h3>Selected Meeting Rooms:</h3>
          <ol>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
          </ol>
        </div>
        <div>
          <h3>Selected Private Offices:</h3>
          <ol>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
            <li>{"unitName"}</li>
          </ol>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <Button text="Edit Appointment" color="primary" />
      </div>
    </div>
  );
};
