import { FormHandles } from "@unform/core";
import { MutableRefObject } from "react";
import { toast } from "react-toastify";
import { ValidationError } from "yup";

const HTTP_ERROS = {
  ServerInternal: 500,
  Unathorized: 401,
  BadRequest: 400,
};
export function errorHandler(
  error: Error | any,
  formRef?: MutableRefObject<FormHandles>
) {
  if (error instanceof ValidationError) {
    const validationErrors = {};
    if (error instanceof ValidationError) {
      toast.warn("Ops! There are invalid fields.");

      error.inner.forEach((error) => {
        console.log(error);
        validationErrors[error.path] = error.message;
      });
      formRef?.current.setErrors(validationErrors);
    }
  } else {
    const httpError = error?.response?.data?.error;
    if (httpError && httpError.code.indexOf("VALIDATION_ERROR") > -1) {
      if (Array.isArray(httpError.message)) {
        const joinedFields = httpError?.message
          .map((msg) => msg?.field)
          .join(", ");
        if (joinedFields.indexOf("price") > -1) {
          toast.warn(`You must complete the pricing term line.`);
          return;
        }
        toast.warn(
          `Hmm, some required fields were not filled in. (${joinedFields})`
        );
      } else {
        toast.warn(
          capitalizeJusTheFirstLetter(
            `Hmm, some required fields were not filled in.`
          )
        );
      }
    } else if (httpError && Array.isArray(httpError.message)) {
      httpError.message.forEach((err) => {
        toast.warn(capitalizeJusTheFirstLetter(err.message));
      });
    } else if (
      error.message &&
      error.response &&
      error.response.status === HTTP_ERROS.ServerInternal
    ) {
      toast.error("Sorry, an unexpected error occurs. We are already working.");
    } else {
      toast.warn(capitalizeJusTheFirstLetter(error.message));
    }
  }
}

function capitalizeJusTheFirstLetter(
  str: string = "An unexpected error occurs"
) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);

  return capitalized;
}
