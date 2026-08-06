import { Button } from "@components/Button";
import { CustomCheckbox } from "@components/Form/CustomCheckbox";
import { Input } from "@components/Form/Input";
import { Select } from "@components/Form/Select";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
import { useFetch } from "hooks/useFetch";
import Head from "next/head";
import { useRouter } from "next/router";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { ApiItem } from "types";
import { LocationData } from "types/locations";
import * as Yup from "yup";
import styles from "../../styles.module.scss";

interface FormData {
  invitee_first_name: string;
  email: string;
  locations: number[];
  capabilities: ApiItem[];
}

const AddMember = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const formRef = useRef<FormHandles>(null);

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        invitee_first_name: Yup.string().min(2).required(),
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

      await api.post("/cowork/employees/invites", body);
      mutate("/cowork/employees/invites");
      toast.success("Inivite sent.");
      router.push("/settings/members");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelectSrollsToBottom = (
    event: WheelEvent | TouchEvent
  ) => {
    if (event.target) {
      if (allLocations.pageCount < pagination.lastPage) {
        setAllLocations((state) => ({
          ...state,
          pageCount: state.pageCount + 1,
        }));
      }
    }
  };

  return (
    <>
      <Head>
        <title>Add Wallet | Workeaser</title>
      </Head>

      <Form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.walletFormContainer}
      >
        <section>
          <header>
            <h2>Add New Member:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.membersInputFieldsContainer}>
            {/* <div className={styles.inputFieldsRow}>
              <Input name="lastName" placeholder="Last Name" />
            </div> */}
            <Input name="invitee_first_name" placeholder="First Name" />
            <Input name="email" placeholder="Email" />
          </div>

          <div className={styles.selectContainer}>
            <Select
              instanceId="location_id"
              name="locations"
              placeholder="Select Locations"
              isMulti
              formatType="locations"
              options={allLocations?.data.map((location) => ({
                value: location.id,
                label: location.name,
                name: location.name,
                photo: location.photos[0],
                address: location.address,
              }))}
              isLoading={locationsLoadiong}
              onMenuScrollToBottom={handleLocationSelectSrollsToBottom}
            />
          </div>
        </section>

        <section>
          <header>
            <h2>Account Capability:</h2>
            <span className={styles.line}></span>
          </header>

          <div className={styles.membersInputFieldsContainer}>
            <p>Select which modules do you want your member to manage:</p>
          </div>

          <div className={styles.checkbox__container}>
            <CustomCheckbox
              name="capabilities[0]"
              value={1}
              label="Locations"
            />
            <CustomCheckbox name="capabilities[1]" value={2} label="Services" />
            <CustomCheckbox
              name="capabilities[2]"
              value={3}
              label="Relationship"
            />
            <CustomCheckbox name="capabilities[3]" value={4} label="Finances" />
            <CustomCheckbox name="capabilities[4]" value={5} label="Reports" />
            <CustomCheckbox name="capabilities[5]" value={6} label="Settings" />
          </div>
        </section>

        <div className={styles.buttonsContainer}>
          <Button
            type="submit"
            text="INVITE NEW MEMBER"
            color="primary"
            loading={isLoading}
            extraClass={isLoading ? styles.loading : ""}
          />
        </div>
      </Form>
    </>
  );
};

AddMember.authRoles = ["COWORKING"];
AddMember.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default AddMember;
