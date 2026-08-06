import { Button } from "@components/Button";
import { Dropzone } from "@components/Form/Dropzone";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { InitialFeeForm } from "@components/FormBlocks/InitialFeeForm";
import { PricingForm } from "@components/FormBlocks/PricingForm";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
import { formatPricing } from "@utils/form.utils";
import { currencyUnmask, percentageMask } from "@utils/masks";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { Fallback, LocationAddressRelation } from "types";
import {
  VirtualOfficeData,
  VirtualOfficeFormData,
  VirtualOfficePostData,
  VirtualOfficeResponse,
} from "types/cowork/locations/virtualOffice";
import { TermSize } from "types/infos";
import { LocationData } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

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
  const { id } = context.query;

  const locationsPromise = apiClient.get<LocationData>("/cowork/locations");
  const termSizesPromise = apiClient.get("/infos/termsizes");
  const promises: Promise<any>[] = [locationsPromise, termSizesPromise];

  if (id) {
    const virtualOfficePromise = apiClient.get<VirtualOfficeResponse>(
      `/cowork/virtualoffices/${id}`
    );
    promises.push(virtualOfficePromise);
  }

  const responseArray = await Promise.all(promises);
  const [{ data: locations }, { data: termSizesData }, roomResponse] =
    responseArray;
  const initialData = roomResponse ? roomResponse.data.result : null;

  return {
    props: {
      locationsFallback: {
        "/cowork/locations": locations,
      },
      initialData,
      termSizes: termSizesData.result,
    },
  };
};

interface AddVirtualOfficeProps {
  locationsFallback: Fallback;
  initialData: VirtualOfficeData;
  termSizes: TermSize[];
}
const AddVirtualOffice = ({
  locationsFallback,
  initialData,
  termSizes,
}: AddVirtualOfficeProps) => {
  const formRef = useRef<FormHandles>(null);

  const [isPricingView, setIsPricingView] = useState<boolean>();
  const [animationEnd, setAnimationEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<LocationAddressRelation>();

  const [pricingError, setPricingError] = useState(false);
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const router = useRouter();
  const { id } = router.query;

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  useEffect(() => {
    if (locations && !locationsLoadiong) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  useEffect(() => {
    if (initialData) {
      const formData = {
        ...initialData,
        location_id: initialData.location_id,
        has_dir_listing: initialData.has_dir_listing ? "yes" : "no",
        has_mailing: initialData.has_mailing ? "yes" : "no",
        has_phone_answer: initialData.has_phone_answer ? "yes" : "no",
        has_voip: initialData.has_voip ? "yes" : "no",
        searchable: initialData.searchable ? "yes" : "no",
        renewal_tax: percentageMask(String(initialData.renewal_tax)),
      };
      formRef.current?.setData(formData);
    }
  }, [initialData]);

  const handleSubmit: SubmitHandler<VirtualOfficeFormData> = async (data) => {
    try {
      formRef.current.setErrors({});
      setPricingError(false);

      const schema = Yup.object().shape({
        name: Yup.string().min(2).required(),
        description: Yup.string().min(3).required(),
        location_id: Yup.string().required(),
        coworking_usage_mo: Yup.number().required(),
        meetroom_usage_mo: Yup.number().required(),
        photos: Yup.array().min(4),
      });
      await schema.validate(data, {
        abortEarly: false,
      });
      if (isPricingView === undefined || isPricingView) {
        setIsPricingView(false);
        return;
      }

      setIsLoading(true);

      const prices = formatPricing(data.prices);
      if (prices.length < 1) {
        setPricingError(true);
        throw new Error("Fill at least one pricing value");
      }

      const oldImages = data.photos.reduce(
        (acc, currentImage) =>
          currentImage.id ? [...acc, { id: currentImage.id }] : acc,
        []
      );
      const imagesPromises = data.photos.reduce(
        (acc, currentImage) =>
          currentImage.name ? [...acc, uploadImage(currentImage)] : acc,
        []
      );
      const imagesResponse = await Promise.all(imagesPromises);
      const newImages = imagesResponse.map((item) => ({ id: item.id }));

      const body: VirtualOfficePostData = {
        ...data,
        has_dir_listing: data.has_dir_listing === "yes",
        has_mailing: data.has_mailing === "yes",
        has_phone_answer: data.has_phone_answer === "yes",
        has_voip: data.has_voip === "yes",
        searchable: data.searchable === "yes",
        photos: [...oldImages, ...newImages],
        renewal_tax: parseInt(currencyUnmask(data.renewal_tax)) ?? 0,
        prices,
        fees: data.fees.reduce(
          (acc, currentFee) =>
            currentFee.name
              ? [
                  ...acc,
                  {
                    ...currentFee,
                    amount: parseInt(
                      currentFee.amount.replace(/\$|,|\.|%/g, "")
                    ),
                  },
                ]
              : acc,
          []
        ),
      };

      if (id) {
        await api.put(`/cowork/virtualoffices/${id}`, body);
        mutate("/cowork/virtualoffices");
        toast.success("Virtual Offices updated");
      } else {
        await api.post("/cowork/virtualoffices", body);
        mutate("/cowork/virtualoffices");
        toast.success("Virtual Offices added");
      }
      router.push("/services/virtual-office");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimationEnd = () => {
    setAnimationEnd(isPricingView);
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
        <title>{id ? "Update" : "Add"} Virtual Office Plan | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href="/services/dashboard">Services</Link>
            </h1>
            <h2>
              <Link href="/services/virtual-office">Virtual Office</Link>
            </h2>
            <h2>{id ? "Update" : "Create"} Virtual Office</h2>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <h1>{id ? "Update" : "Create"} Virtual Office Plan</h1>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            className={styles.formContainer}
            initialData={{
              has_dir_listing: "yes",
              has_mailing: "yes",
              has_phone_answer: "yes",
              has_voip: "yes",
              // coworking_usage_mo: 0,
              // meetroom_usage_mo: 0,
              searchable: "yes",
            }}
          >
            <div className={styles.formContent}>
              <div
                className={`${styles.formElements} ${
                  isPricingView === undefined
                    ? styles.on
                    : isPricingView
                    ? styles.fadeIn
                    : styles.fadeOut
                } `}
                onAnimationEnd={handleAnimationEnd}
              >
                <div>
                  <Input name="name" type="text" placeholder="Plan Name" />

                  <Textarea
                    name="description"
                    placeholder="Description"
                    extraClass={styles.textarea}
                  ></Textarea>

                  <Dropzone
                    name="photos"
                    label="Drag &amp; Drop the Plan Photos"
                    disclaimer="* The first photo will the cover image."
                  />
                </div>

                <div>
                  <Select
                    name="location_id"
                    placeholder="Space Name"
                    icon="location"
                    formatType="locations"
                    locationId={initialData?.location_id}
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

                  <div className={styles.flexRow}>
                    <p>
                      This plan includes <strong>Directory Listing?</strong>
                    </p>
                    <Radio
                      name="has_dir_listing"
                      options={[
                        {
                          value: "yes",
                          label: "Yes",
                        },
                        { value: "no", label: "No" },
                      ]}
                    />
                  </div>
                  <div className={styles.flexRow}>
                    <p>
                      This plan includes <strong>Mailing Receipt?</strong>
                    </p>
                    <Radio
                      name="has_mailing"
                      options={[
                        {
                          value: "yes",
                          label: "Yes",
                        },
                        { value: "no", label: "No" },
                      ]}
                    />
                  </div>
                  <div className={styles.flexRow}>
                    <p>
                      This plan includes <strong>Phone Answering?</strong>
                    </p>
                    <Radio
                      name="has_phone_answer"
                      options={[
                        {
                          value: "yes",
                          label: "Yes",
                        },
                        { value: "no", label: "No" },
                      ]}
                    />
                  </div>
                  <div className={styles.flexRow}>
                    <p>
                      This plan includes <strong>VoIP?</strong>
                    </p>
                    <Radio
                      name="has_voip"
                      options={[
                        {
                          value: "yes",
                          label: "Yes",
                        },
                        { value: "no", label: "No" },
                      ]}
                    />
                  </div>

                  <div className={styles.flexRow}>
                    <p>
                      How many Days of{" "}
                      <strong>Coworking usage per Month?</strong>
                    </p>
                    <Input
                      name="coworking_usage_mo"
                      type="number"
                      placeholder="00"
                      min="0"
                      max="31"
                      extraClass={styles.input}
                    />
                  </div>

                  <div className={styles.flexRow}>
                    <p>
                      How many hours of{" "}
                      <strong>Meeting Room usage per Month?</strong>
                    </p>
                    <Input
                      name="meetroom_usage_mo"
                      type="number"
                      placeholder="00"
                      min="0"
                      extraClass={styles.input}
                    />
                  </div>

                  <div className={styles.flexRow}>
                    <p>
                      This plan will be available in our{" "}
                      <strong>Directory Search?</strong>
                    </p>
                    <Radio
                      name="searchable"
                      options={[
                        {
                          value: "yes",
                          label: "Yes",
                        },
                        { value: "no", label: "No" },
                      ]}
                    />
                  </div>
                  <p className={styles.footerText}>
                    * If you choose to display this service in our directory
                    research, and once a new customer closes a new contract,
                    Workeaser will be the contract holder. Read more about this
                    policy in <a>this link</a>.
                  </p>
                </div>
              </div>

              <div
                className={`${styles.pricesContainer} ${
                  isPricingView === undefined
                    ? styles.off
                    : isPricingView
                    ? styles.fadeOut
                    : styles.fadeIn
                } ${animationEnd ? styles.off : ""}`}
              >
                <div>
                  <h2>
                    <strong>Initial Payment</strong> for this Service
                  </h2>

                  <p className={styles.disclaimerText}>
                    The initial payment will be automaticaly added to the first
                    invoice one you attach this service to a lead or cliente.
                    For example, onboarding fees, account setup fees, and so
                    on...
                  </p>

                  <div className={styles.feeFormContainer}>
                    <InitialFeeForm
                      formRef={formRef}
                      initialData={initialData?.fees}
                    />
                  </div>
                </div>
                <div>
                  <h2>
                    <strong>Recurring Payments</strong> by Contract Term
                  </h2>
                  <p className={styles.disclaimerText}>
                    Service payment value setup. Id don&apos;t wish to work with
                    any pricing type please leave it in blank or with zero, by
                    doing this, that pricing type will be inactive in the
                    attachment process.
                  </p>

                  <PricingForm
                    terms={termSizes}
                    initialData={initialData?.prices}
                    error={pricingError}
                    clearError={() => setPricingError(false)}
                  />

                  <div className={`${styles.flexRow} ${styles.pricingRow}`}>
                    <p>Pricing adjustment over contract renewal:</p>
                    <Input
                      name="renewal_tax"
                      mask="percentage"
                      placeholder="0.0%"
                      extraClass={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <Button
                type="button"
                text="PLAN CONFIGURATION"
                color="plain"
                extraClass={`${styles.plainButton} ${
                  isPricingView === undefined || isPricingView ? styles.on : ""
                }`}
                onClick={() => setIsPricingView(true)}
              />

              <Button
                type="submit"
                text={
                  isPricingView === undefined || isPricingView
                    ? "PRICING CONFIGURATION"
                    : id
                    ? "UPDATE VIRTUAL OFFICE"
                    : `CREATE VIRTUAL OFFICE`
                }
                loading={isLoading}
                extraClass={isLoading ? styles.loading : ""}
              />
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddVirtualOffice;
AddVirtualOffice.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
