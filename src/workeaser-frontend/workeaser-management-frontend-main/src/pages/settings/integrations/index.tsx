import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { PagesProps } from "pages/_app";
import React, { ReactElement } from "react";

const Integrations = () => {
  return <></>;
};

Integrations.authRoles = ["COWORKING"];
Integrations.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default Integrations;
