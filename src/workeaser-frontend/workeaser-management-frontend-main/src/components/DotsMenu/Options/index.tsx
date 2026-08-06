import { DotsMenuButton } from "@components/Button/DotsMenuButton";
import { Icomoon } from "@components/Icomoon";
import React from "react";
import { ContentRow } from "./styles";

interface OptionsProps {
  type?: string;
  onGreenButtonClick: () => void;
  onYellowButtonClick: () => void;
  onRedButtonClick: () => void;
}

export const Options: React.FC<OptionsProps> = ({
  type = "default",
  onGreenButtonClick,
  onYellowButtonClick,
  onRedButtonClick,
}) => {
  return (
    <>
      <ContentRow>
        <DotsMenuButton
          text={
            type === "lead" ? "Accept" : type === "view" ? "View" : "Preview"
          }
          icon={type === "lead" ? "like" : "eye"}
          theme="success"
          onClick={onGreenButtonClick}
        />
        <DotsMenuButton
          text={type === "lead" ? "Negotiate" : "Edit"}
          icon={type === "lead" ? "chat" : "write"}
          theme="warning"
          onClick={onYellowButtonClick}
        />
        <DotsMenuButton
          text={type === "lead" ? "Reject" : "Delete"}
          icon={type === "lead" ? "like" : "trash"}
          theme="danger"
          flip={type === "lead"}
          onClick={onRedButtonClick}
        />
      </ContentRow>
    </>
  );
};
