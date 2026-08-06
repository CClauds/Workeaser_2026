import { api } from "@services/api";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

const NewClient = () => {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.post("/auth/email-confirmation", {
          token,
        });
        console.log({ response });
        router.replace("/login");
        toast.success("Email Verified.");
      } catch (error) {
        console.log(error.response.data);
        if (
          error?.response?.data?.code &&
          error.response.data.code.indexOf("E_ROW_NOT_FOUND") > -1
        ) {
          toast.error("Token inválido");
          router.replace("/login");
        }
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return <></>;
};

export default NewClient;
