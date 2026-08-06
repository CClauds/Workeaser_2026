import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";

interface Suggestion {
  id: string;
  fulltext: string;
}

interface InputSuggestionsProps {
  isFocused: boolean;
  suggestions: Suggestion[];
  onSuggestionClick: (index: number) => void;
}

export const InputSuggestions: React.FC<InputSuggestionsProps> = ({
  isFocused,
  suggestions,
  onSuggestionClick,
}) => {
  const [isOpen, setIsOpen] = useState(isFocused);

  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const checkIfClickedOutside = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setIsOpen(isFocused);
      }
    };

    document.addEventListener("mouseup", checkIfClickedOutside);
    return () => document.removeEventListener("mouseup", checkIfClickedOutside);
  }, [isFocused]);

  const handleClick = (index: number) => () => {
    onSuggestionClick(index);
    setIsOpen(false);
  };

  return (
    <ul
      ref={listRef}
      className={`
          ${styles.container}
          ${isOpen ? styles.open : ""}
        `}
    >
      {suggestions.map((suggestion, index) => (
        <li key={suggestion.id} onClick={handleClick(index)}>
          <p className={styles.title}>{suggestion.fulltext}</p>
        </li>
      ))}
    </ul>
  );
};
