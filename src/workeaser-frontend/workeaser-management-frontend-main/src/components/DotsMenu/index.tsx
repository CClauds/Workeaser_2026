import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import { Dotsmenu } from "types";
import { Icomoon } from "../Icomoon";
import styles from "./styles.module.scss";

interface DotsMenuProps {
  id: string;
  onMenuClick?: (id: string, button: Dotsmenu) => void;
}

export const DotsMenu: React.FC<DotsMenuProps> = ({ id, onMenuClick }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mouseup", checkIfClickedOutside);
    return () => document.removeEventListener("mouseup", checkIfClickedOutside);
  }, [isMenuOpen]);

  const handleClick = (e: SyntheticEvent) => {
    e.stopPropagation();
    setIsMenuOpen(true);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`
          ${styles.container}
          ${isMenuOpen ? styles.open : ""}
        `}
      >
        {isMenuOpen ? (
          <svg width="7.991" height="7.991" viewBox="0 0 7.991 7.991">
            <g
              id="Grupo_1723"
              data-name="Grupo 1723"
              transform="translate(-24.222 -26.222)"
            >
              <rect
                id="Retângulo_423"
                data-name="Retângulo 423"
                width="10.273"
                height="1.027"
                rx="0.514"
                transform="translate(24.948 26.222) rotate(45)"
                fill="#fff"
              />
              <rect
                id="Retângulo_424"
                data-name="Retângulo 424"
                width="10.273"
                height="1.027"
                rx="0.514"
                transform="translate(32.212 26.948) rotate(135)"
                fill="#fff"
              />
            </g>
          </svg>
        ) : (
          <Icomoon iconName="dots-menu" onClick={handleClick} />
        )}
      </div>

      <div
        ref={menuRef}
        className={`
          ${styles.menu}
          ${isMenuOpen ? styles.open : ""}
        `}
      >
        <div className={styles.flexRow}>
          <button
            className={styles.success}
            onClick={() => onMenuClick(id, "view")}
          >
            <Icomoon iconName="eye" />
            Preview
          </button>

          <button
            className={styles.warning}
            onClick={() => onMenuClick(id, "edit")}
          >
            <Icomoon iconName="write" />
            Edit
          </button>
          <button
            className={styles.danger}
            onClick={() => onMenuClick(id, "delete")}
          >
            <Icomoon iconName="trash" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
