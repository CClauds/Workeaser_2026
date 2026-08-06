import { Button } from "@components/Button";
import { ToggleButton } from "@components/Button/ToggleButton";
import { Dropzone } from "@components/Form/Dropzone";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { InitialFeeForm } from "@components/FormBlocks/InitialFeeForm";
import { PricingForm } from "@components/FormBlocks/PricingForm";
import { PageHeader } from "@components/Headers/PageHeader";
import { Help } from "@components/Icons";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { CustomTooltip } from "@components/Tooltip/Custom";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
import { formatPricing } from "@utils/form.utils";
import { currencyUnmask, percentageMask } from "@utils/masks";
import Money from "dinero.js";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import { mutate } from "swr";
import { Fallback } from "types";
import { PricingPeriodEnum } from "types/cowork/locations/enum";
import type {
  RoomData,
  RoomFormData,
  RoomPostData,
  RoomResponse,
} from "types/cowork/locations/rooms";
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

  const locationsPromise = apiClient.get<LocationData>(
    "/cowork/locations?page=1"
  );
  const termSizesPromise = apiClient.get("/infos/termsizes");
  const promises: Promise<any>[] = [locationsPromise, termSizesPromise];

  if (id) {
    const roomPromise = apiClient.get<RoomResponse>(`/cowork/rooms/${id}`);
    promises.push(roomPromise);
  }

  const responseArray = await Promise.all(promises);
  const [{ data: locations }, { data: termSizesData }, roomResponse] =
    responseArray;
  const initialData = roomResponse ? roomResponse.data.result : null;

  return {
    props: {
      locationsFallback: {
        "/cowork/locations?page=1": locations,
      },
      initialData,
      termSizes: termSizesData.result,
    },
  };
};

interface AddRoomProps {
  locationsFallback: Fallback;
  initialData: RoomData;
  termSizes: TermSize[];
}
const AddRoom = ({ initialData, termSizes }: AddRoomProps) => {
  const theme = useTheme();
  const router = useRouter();
  const { id } = router.query;

  const [isPricingView, setIsPricingView] = useState<boolean>();
  const [radioValue, setRadioValue] = useState("shareable");
  const [animationEnd, setAnimationEnd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingError, setPricingError] = useState(false);
  const [dayPassPrice, setDayPassPrice] = useState(0);
  const [isDayPriceActive, setIsDayPriceActive] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<boolean>();
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

  useEffect(() => {
    if (initialData) {
      setDayPassPrice(initialData.day_price);
      const formData = {
        ...initialData,
        shareable: initialData.shareable ? "shareable" : "private",
        searchable: initialData.searchable ? "yes" : "no",
        renewal_tax: percentageMask(String(initialData.renewal_tax)),
      };
      setIsDayPriceActive(!!initialData.is_daypass_enabled);
      formRef.current?.setData(formData);
    }
  }, [initialData]);

  const handleSubmit: SubmitHandler<RoomFormData> = async (data) => {
    try {
      formRef.current.setErrors({});
      setPricingError(false);

      const schema = Yup.object().shape({
        name: Yup.string().min(2).required(),
        description: Yup.string().min(3).required(),
        location_id: Yup.string().required(),
        photos: Yup.array().min(4),
        day_price:
          isPricingView === undefined || isPricingView || !isDayPriceActive
            ? null
            : Yup.string().notOneOf(["$0.00"]).required(),
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

      const body: RoomPostData = {
        ...data,
        shareable: false,
        // shareable: data.shareable === "shareable",
        searchable: data.searchable === "yes",
        photos: [...oldImages, ...newImages],
        renewal_tax: parseInt(currencyUnmask(data.renewal_tax)),
        day_price: currencyUnmask(data.day_price),
        is_daypass_enabled: isDayPriceActive ? 1 : 0,
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
        await api.put(`/cowork/rooms/${id}`, body);
        mutate("/cowork/rooms");
        toast.success("Room updated");
      } else {
        await api.post("/cowork/rooms", body);
        mutate("/cowork/rooms");
        toast.success("Room added");
      }
      router.push("/services/private-rooms");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setRadioValue(event.target.value);
  // };

  const handleAnimationEnd = () => {
    setAnimationEnd(isPricingView);
  };

  const handleDayPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const number = currencyUnmask(value);
    if (!number) {
      setDayPassPrice(0);
      return;
    }

    setDayPassPrice(parseInt(number, 10) ?? 0);
  };

  const toggleTooltip = (value: boolean) => () => setActiveTooltip(value);

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
        <title>Add Private Room | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href="/services/private-rooms">Services</Link>
            </h1>
            <h2>
              <Link href="/services/private-rooms">Private Room</Link>
            </h2>
            <h2>{id ? "Update" : "Create"} Private Room</h2>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <h1>
            {/* {id ? "Update" : "Create"} {capitalizeFirstLetter(radioValue)} Room */}
            {id ? "Update" : "Create"} Private Room
          </h1>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            className={styles.formContainer}
            initialData={{
              shareable: "shareable",
              // space_size: 0,
              // room_capacity: 0,
              searchable: "yes",
              space_size_unit: "FEETS",
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
                  <Input
                    name="name"
                    type="text"
                    placeholder="Room Number / Name"
                  />

                  <Textarea
                    name="description"
                    placeholder="Description"
                    extraClass={styles.textarea}
                  ></Textarea>

                  <Dropzone
                    name="photos"
                    label="Drag &amp; Drop the Room Photos"
                    disclaimer="* The first photo will the cover image."
                  />
                </div>

                <div>
                  <Select
                    instanceId="location_id"
                    locationId={initialData?.location_id}
                    name="location_id"
                    placeholder="Space Name"
                    icon="location"
                    formatType="locations"
                    defaultValue={
                      initialData?.location_id
                        ? allLocations?.data.find(
                            (loc) => loc.id == initialData?.location_id
                          )
                        : {}
                    }
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

                  {/* <div className={styles.flexRow}>
                  <p>Is this room Shareable or Private?</p>
                  <Radio
                    name="shareable"
                    onChange={handleRadioChange}
                    options={[
                      {
                        value: "shareable",
                        label: "Shareable",
                      },
                      { value: "private", label: "Private" },
                    ]}
                  />
                </div> */}

                  <div className={styles.flexRow}>
                    <p>Measurement Type:</p>
                    <Radio
                      name="space_size_unit"
                      options={[
                        {
                          value: "FEETS",
                          label: "Feets",
                        },
                        { value: "METERS", label: "Meters" },
                      ]}
                    />
                  </div>

                  <div className={styles.flexRow}>
                    <p>How big is this room?</p>
                    <Input
                      name="space_size"
                      type="number"
                      placeholder="00"
                      min="0"
                      extraClass={styles.input}
                    />
                  </div>

                  <div className={styles.flexRow}>
                    <p>How many persons fits comfortably in this room?</p>
                    <Input
                      name="room_capacity"
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
                  <div className={`${styles.flexRow} ${styles.pricingRow}`}>
                    <div className={styles.dayPassContaienr}>
                      <p>Day Pass price:</p>
                      <div
                        onMouseEnter={toggleTooltip(true)}
                        onMouseLeave={toggleTooltip(false)}
                      >
                        <Help size={18} color={theme.colors.blue200} />
                        <CustomTooltip
                          isActive={activeTooltip}
                          message="If you enable this pricing, our users will be able to rent your asset on a daily basis through our marketplace and their membership"
                        />
                      </div>
                    </div>

                    <ToggleButton
                      initialValue={!!initialData?.is_daypass_enabled}
                      onToggle={(value) => setIsDayPriceActive(value)}
                    />
                    <Input
                      name="day_price"
                      placeholder="$0,000.00"
                      width={90}
                      value={
                        dayPassPrice
                          ? Money({ amount: dayPassPrice }).toFormat("$0,0.00")
                          : ""
                      }
                      onChange={handleDayPriceChange}
                      extraClass={styles.input}
                      disabled={!isDayPriceActive}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <Button
                type="button"
                text="ROOM CONFIGURATION"
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
                    ? `UPDATE ${radioValue.toUpperCase()} ROOM`
                    : `CREATE ${radioValue.toUpperCase()} ROOM`
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

export default AddRoom;
AddRoom.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
