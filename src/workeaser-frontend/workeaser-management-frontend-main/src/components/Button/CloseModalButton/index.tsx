import React, { ButtonHTMLAttributes } from "react";

interface CloseModalButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
}

export const CloseModalButton: React.FC<CloseModalButtonProps> = ({
  color = "#2b3450",
  ...props
}) => {
  return (
    <button type="button" className="react-modal-close" {...props}>
      <p style={{ color }}>CLOSE</p>
      <svg width="15.556" height="15.556" viewBox="0 0 15.556 15.556">
        <rect
          width="20"
          height="2"
          rx="1"
          transform="translate(1.414) rotate(45)"
          fill={color}
        />
        <rect
          width="20"
          height="2"
          rx="1"
          transform="translate(15.556 1.414) rotate(135)"
          fill={color}
        />
      </svg>
    </button>
  );
};
