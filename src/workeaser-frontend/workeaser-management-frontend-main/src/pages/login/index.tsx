import { CustomLink } from "@components/CustomLink";
import { Icomoon } from "@components/Icomoon";
import { LoginLayout } from "@components/Layouts/LoginLayout";
import { LoginBox } from "@components/LoginBox/index";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "./styles.module.scss";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const { error, status } = router.query;
    if (error && status) {
      console.log(status);
      if (parseFloat(status.toString()) === 406) {
        toast.error("Nenhum coworking associado a este usuário");
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Entrar | Workeaser</title>
      </Head>
      <LoginBox />

      <div className={styles.createAccount__container}>
        <CustomLink>
          <Icomoon iconName="star" />
          <p>
            Ainda não tem conta?{" "}
            <a onClick={() => router.push("/create-account")}>
              Criar conta grátis
            </a>
          </p>
        </CustomLink>
      </div>
    </>
  );
};

Login.getLayout = (page: ReactElement) => <LoginLayout>{page}</LoginLayout>;
export default Login;
