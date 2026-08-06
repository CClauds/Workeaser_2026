import { theme } from "@styles/themes";
import Image from "next/legacy/image";
import React, { ReactNode, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ThemeProvider } from "styled-components";
import memberImg from "../../../../public/images/regular-user-login-image.jpg";
import { Container, Content, Footer } from "./styles";
import { useRouter } from "next/router";

interface LoginLayoutProps {
  children: ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const { expired } = router.query;
    if (expired) toast.error("Session Expired");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Content>
          {children}
          <Footer>
            <p>© 2021 Workweaser. All Rights Reserved.</p>
          </Footer>
        </Content>
        <Image src={memberImg} objectFit="cover" alt="cover" priority />
      </Container>
      <ToastContainer />
    </ThemeProvider>
  );
};
