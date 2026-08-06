import { ButtonHTMLAttributes, useState } from "react";
import { Container, Wrapper } from "./styles";

interface ToggleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  initialValue?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  onToggle?: (value: boolean) => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  initialValue,
  activeLabel,
  inactiveLabel,
  onToggle,
  ...rest
}) => {
  const [isActive, setIsActive] = useState(initialValue ?? false);

  const toggleButton = () => {
    setIsActive(!isActive);
    if (onToggle) onToggle(!isActive);
  };

  return (
    <Wrapper>
      {activeLabel && (
        <p className="toggle__label">
          {isActive ? activeLabel : inactiveLabel}
        </p>
      )}
      <Container
        active={isActive}
        type="button"
        onClick={toggleButton}
        {...rest}
      >
        <span />
      </Container>
    </Wrapper>
  );
};
