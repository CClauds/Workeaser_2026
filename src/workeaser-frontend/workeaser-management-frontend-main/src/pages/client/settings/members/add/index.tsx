import { CustomCheckbox } from "@components/Form/CustomCheckbox";
import { Select } from "@components/Form/Select";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { Button } from "components/Button";
import { Input } from "components/Form/Input";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { ApiItem } from "types";
import { MembershipResponse } from "types/client";
import * as Yup from "yup";
import styles from "../../styles.module.scss";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { "user-token": token } = parseCookies(context);
  if (!token) {
    return {
      redirect: {
        destination: "/login?expired=true",
        permanent: false,
      },
    };
  }

  const apiClient = getAPIClient(context);

  const { data: memberships } = await apiClient.get<MembershipResponse>(
    "/client/membership"
  );

  return {
    props: {
      locations: memberships.result.map((membership) => ({
        value: membership.id,
        name: membership.location_name,
        photo: membership.photos[0],
        address: membership.address,
      })),
    },
  };
};

interface FormData {
  invitee_first_name: string;
  // lastName: string;
  email: string;
  locations: number[];
  capabilities: ApiItem[];
}

interface AddMemberProps {
  locations: {
    value: number;
    name: string;
    photo: string;
    address: string;
  }[];
}
const AddMember = ({ locations }: AddMemberProps) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<FormHandles>(null);

  // const { data: { result: locations } = {} } =
  //   useFetch<LocationData>("/cowork/locations");

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        invitee_first_name: Yup.string().min(2).required(),
        // lastName: Yup.string().min(2).required(),
        email: Yup.string().email().required(),
        locations: Yup.array().min(1),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const body = {
        ...data,
        email: data.email,
        locations: data.locations.map((location) => ({ id: location })),
        capabilities: data.capabilities.reduce(
          (acc, currentValue) =>
            currentValue.checked ? [...acc, { id: currentValue.id }] : acc,
          []
        ),
      };

      await api.post("/client/teams/invites", body);
      mutate("/client/teams/invites");
      toast.success("Inivite sent.");
      router.push("/client/settings/members");
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            validationErrors[error.path] = error.message;
            console.log(error.message);
          });
          formRef.current.setErrors(validationErrors);
        }
      } else {
        if (!Array.isArray(err?.response?.data.error.message)) {
          toast.error(err?.response?.data.error.message);
        } else {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add Team Member | Workeaser</title>
      </Head>

      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.members__form}
      >
        <section>
          <header>
            <h2>Add New Member:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.content}>
            <div className={styles.inputFieldsContainer}>
              <Input name="invitee_first_name" placeholder="First Name" />
              <Input name="email" placeholder="Email" />
              <Select
                instanceId="locationsSelect"
                name="locations"
                placeholder="Select Locations"
                isMulti
                isSearchable
                options={locations?.map((location) => ({
                  value: location.value,
                  label: location.name,
                  name: location.name,
                  photo: location.photo,
                  address: location.address,
                }))}
                formatType="locations"
              />
            </div>
          </div>
        </section>

        <section>
          <header>
            <h2>Account Capability:</h2>
            <span className={styles.line}></span>
          </header>

          <p>Select which modules do you want your member to manage:</p>

          <div className={styles.checkbox__container}>
            <CustomCheckbox
              name="capabilities[0]"
              value={1}
              label="Benefits Overview"
            />
            <CustomCheckbox
              name="capabilities[1]"
              value={2}
              label="Products &amp; Services"
            />
            <CustomCheckbox
              name="capabilities[2]"
              value={3}
              label="Booking Schedule"
            />
            <CustomCheckbox
              name="capabilities[3]"
              value={4}
              label="Mailbox Manager"
            />
            <CustomCheckbox
              name="capabilities[4]"
              value={5}
              label="Payment &amp; Invoices"
            />
            <CustomCheckbox
              name="capabilities[5]"
              value={6}
              label="Space Support"
            />
          </div>
        </section>

        <div className={styles.buttonsContainer}>
          <Button
            type="submit"
            text="INVITE NEW MEMBER"
            color="primary"
            loading={isLoading}
          />
        </div>
      </Form>
    </>
  );
};

AddMember.authRoles = ["CLIENT"];
AddMember.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <ClientLayout componentProps={componentProps}>
      <SettingsLayout title="Account Settings" role="CLIENT">
        {page}
      </SettingsLayout>
    </ClientLayout>
  );
};
export default AddMember;
