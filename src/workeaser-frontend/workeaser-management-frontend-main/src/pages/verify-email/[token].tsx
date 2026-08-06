import { api } from "@services/api";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

const VerifyEmail = () => {
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
        toast.success("Email verificado com sucesso!");
      } catch (error) {
        console.log(error.response.data);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return <></>;
};

export default VerifyEmail;
