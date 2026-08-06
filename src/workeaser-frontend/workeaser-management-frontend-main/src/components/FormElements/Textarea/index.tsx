import { forwardRef, MutableRefObject, TextareaHTMLAttributes } from "react";
import { TextArea } from "./styles";

export interface StyledTextAreaProps {
  error?: boolean;
  hasIcon?: boolean;
}

interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    StyledTextAreaProps {
  className?: string;
}

const TextAreaElement = (
  { className = "", ...props },
  ref: MutableRefObject<HTMLTextAreaElement>
) => <TextArea ref={ref} className={`${className}`} {...props} />;

export const TextAreaComponent = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  TextAreaElement
);
