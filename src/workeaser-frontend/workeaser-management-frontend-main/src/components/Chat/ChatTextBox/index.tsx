import React, { KeyboardEventHandler, useRef } from "react";

import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";

import { Button } from "../../Button";
import { Textarea } from "../../Form/Textarea";

import { Avatar } from "@components/Avatar";
import styles from "./styles.module.scss";

import "react-loading-skeleton/dist/skeleton.css";

interface FormData {
  message: string;
}

interface ChatTextBoxProps {
  chatId: string;
  avatar: string;
  onSendMessage: (message: string) => Promise<void>;
}
export const ChatTextBox: React.FC<ChatTextBoxProps> = ({
  chatId,
  avatar,
  onSendMessage,
}) => {
  const formRef = useRef<FormHandles>(null);

  const handleSubmit: SubmitHandler<FormData> = async (data, { reset }) => {
    const { message } = data;
    if (!message) return;

    await onSendMessage(message);

    reset();
  };

  const handleSendButton = () => {
    if (formRef.current) formRef.current.submitForm();
  };

  const handleKeyEvenet: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key == "Enter" && e.shiftKey == false) {
      e.preventDefault();
      if (formRef.current) formRef.current.submitForm();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.textboxContainer}>
        <figure>
          {avatar ? <Avatar url={avatar} alt="avatar" size={34} /> : null}
        </figure>

        <Form ref={formRef} onSubmit={handleSubmit} className={styles.textArea}>
          <Textarea
            name="message"
            placeholder="Send Message"
            onKeyDown={handleKeyEvenet}
            disabled={!chatId}
          />
        </Form>
      </div>

      <footer>
        <div className={styles.buttonsContainer}>
          {/* <ChatButton icon="image" label="image" />
          <ChatButton icon="play" label="video" />
          <ChatButton icon="attachment" label="attachment" /> */}
        </div>

        <div className={styles.sendButtonsContainer}>
          {/* <div className={styles.translate}>
            <Icomoon iconName="translate" />

            <span>Translate</span>
          </div> */}

          <Button
            text="Send"
            type="submit"
            color="primary"
            onClick={handleSendButton}
            disabled={!chatId}
          />
        </div>
      </footer>
    </div>
  );
};
