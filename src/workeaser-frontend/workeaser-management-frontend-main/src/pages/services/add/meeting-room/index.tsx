import { Button } from "@components/Button";
import { Dropzone } from "@components/Form/Dropzone";
import { HiddenInput } from "@components/Form/HiddenInput";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { api } from "@services/api";
import { uploadImage } from "@services/api/fileUpload";
import { getAPIClient } from "@services/apiClient";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import { errorHandler } from "@utils/errors";
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
import { mutate } from "swr";
import { Fallback } from "types";
import {
  MeetingRoomData,
  MeetingRoomFormData,
  MeetingRoomPostData,
  MeetingRoomResponse,
} from "types/cowork/locations/meetingRoom";
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

  const questionsPromise = apiClient.get("/infos/meetroomquestions");
  const locationsPromise = apiClient.get<LocationData>(
    "/cowork/locations?page=1"
  );
  const promises: Promise<any>[] = [questionsPromise, locationsPromise];

  if (id) {
    const meetroomPromise = apiClient.get<MeetingRoomResponse>(
      `/cowork/meetrooms/${id}`
    );
    promises.push(meetroomPromise);
  }

  const responseArray = await Promise.all(promises);
  const [{ data: questions }, { data: locations }, meetroomResponse] =
    responseArray;
  const initialData = meetroomResponse ? meetroomResponse.data.result : null;

  return {
    props: {
      questions: questions.result,
      locationsFallback: {
        "/cowork/locations?page=1": locations,
      },
      initialData,
    },
  };
};

interface MeetingRoomProps {
  locationsFallback: Fallback;
  questions: {
    id: number;
    question: string;
  }[];
  initialData?: MeetingRoomData;
}
const MeetingRoom = ({
  questions,
  locationsFallback,
  initialData,
}: MeetingRoomProps) => {
  const formRef = useRef<FormHandles>(null);
  const router = useRouter();
  const { id } = router.query;

  const [isLoading, setIsLoading] = useState(false);
  const [isConfigurationBlock, setIsConfigurationBlock] = useState(false);
  const [amount, setAmount] = useState({
    price: 0,
    three: 0,
    half: 0,
    full: 0,
  });
  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

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
      const formData = {
        ...initialData,
        searchable: initialData.searchable ? "yes" : "no",
        space_rules: questions?.map((question) => ({
          answer: initialData.spaceRules.find(
            (rule) => rule.meetroom_question_id === question.id
          )?.answer
            ? "yes"
            : "no",
        })),
      };
      formRef.current?.setData(formData);
      setAmount({
        price: initialData.price,
        three: initialData.discount_three,
        half: initialData.discount_half,
        full: initialData.discount_full,
      });
    }
  }, [initialData]);

  const handleSubmit: SubmitHandler<MeetingRoomFormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().min(2).required(),
        description: Yup.string().min(3).required(),
        location_id: Yup.string().required(),
        type: Yup.string().required(),
        measure_size: Yup.string().required(),
        measure_occupancy: Yup.string().required(),
        minimum_rental: Yup.string().required(),
        photos: Yup.array().min(4),
        price: isConfigurationBlock
          ? Yup.string().notOneOf(["$0.00"]).required()
          : null,
        cancelation_full: isConfigurationBlock
          ? Yup.number().required().positive().integer()
          : null,
        cancelation_half: isConfigurationBlock
          ? Yup.number().required().positive().integer()
          : null,
        cancelation_no: isConfigurationBlock
          ? Yup.number().required().positive().integer()
          : null,
        discount_three: isConfigurationBlock ? Yup.string().required() : null,
        discount_half: isConfigurationBlock ? Yup.string().required() : null,
        discount_full: isConfigurationBlock ? Yup.string().required() : null,
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      if (!isConfigurationBlock) {
        setIsConfigurationBlock(true);
        return;
      }

      setIsLoading(true);

      const rawPrice = parseInt(data.price.replace(/\$|,|\.|%/g, ""));
      if (rawPrice === 0) {
        formRef.current.setFieldError("price", "Value must be grated than 0");
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

      const body: MeetingRoomPostData = {
        ...data,
        price: parseInt(data.price.replace(/\$|,|\.|%/g, "")),
        space_rules: data.space_rules.map((rule) => ({
          ...rule,
          answer: rule.answer === "yes",
        })),
        searchable: data.searchable === "yes",
        discount_three: parseInt(data.discount_three.replace(/\$|,|\.|%/g, "")),
        discount_half: parseInt(data.discount_half.replace(/\$|,|\.|%/g, "")),
        discount_full: parseInt(data.discount_full.replace(/\$|,|\.|%/g, "")),
        photos: [...oldImages, ...newImages],
      };

      if (id) {
        await api.put(`/cowork/meetrooms/${id}`, body);
        mutate("/cowork/meetrooms");
        toast.success("Meeting Room updated");
      } else {
        await api.post("/cowork/meetrooms", body);
        mutate("/cowork/meetrooms");
        toast.success("Meeting Room added");
      }
      router.push("/services/meeting-room");
    } catch (err) {
      errorHandler(err, formRef);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscountChange =
    (filed: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const number = value.replace(/\$|,|\./g, "");

      if (!number) {
        setAmount({
          ...amount,
          [filed]: 0,
        });
        return;
      }

      setAmount({
        ...amount,
        [filed]: parseInt(number, 10) ?? 0,
      });
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
        <title>Add New Room | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href="/services/dashboard">Services</Link>
            </h1>
            <h2>
              <Link href="/services/meeting-room">Meeting Room</Link>
            </h2>
            <h2>Create Meeting Room</h2>
          </div>
        </PageHeader>

        <div className={styles.content}>
          <h1>Create Meeting Room</h1>
          <Form
            ref={formRef}
            onSubmit={handleSubmit}
            initialData={{
              measure_unit: "FEETS",
              // measure_size: 0,
              // measure_occupancy: 0,
              rental_timeframe: "MINUTES_30",
              searchable: "yes",
              space_rules: [
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
                {
                  answer: "yes",
                },
              ],
            }}
            className={styles.formContainer}
          >
            <div className={styles.formContent}>
              <div
                className={`${styles.formElements} ${
                  isConfigurationBlock ? styles.hidden : styles.visible
                }`}
              >
                <div>
                  <Input name="name" type="text" placeholder="Name" />

                  <Textarea name="description" placeholder="Description" />

                  <Select
                    locationId={initialData?.location_id}
                    instanceId="location_id"
                    name="location_id"
                    placeholder="Space Name"
                    icon="location"
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

                  <div>
                    <Dropzone
                      name="photos"
                      label="Drag &amp; Drop the Room Photos"
                      disclaimer="* The first photo will the cover image."
                    />
                  </div>
                </div>

                <div>
                  <Select
                    instanceId="categorySelect"
                    name="type"
                    placeholder="Meeting Room Category"
                    options={[
                      { value: "DESK", label: "Desk" },
                      { value: "CALL", label: "Call" },
                      { value: "MEETING", label: "Meeting" },
                      { value: "CONFERENCE", label: "Conference" },
                      { value: "PRIVATE", label: "Private" },
                      { value: "AUDITORIUM", label: "Auditorium" },
                    ]}
                  />

                  <div className={styles.flexRow}>
                    <p>Measurement Type:</p>
                    <div className={styles.radioContainer}>
                      <Radio
                        name="measure_unit"
                        options={[
                          {
                            value: "FEETS",
                            label: "Feets",
                          },
                          { value: "METERS", label: "Meters" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className={styles.flexRow}>
                    <p>How big is the room?</p>
                    <Input
                      name="measure_size"
                      type="number"
                      pattern="[0-9]"
                      placeholder="00"
                      min="0"
                      width={80}
                    />
                  </div>
                  <div className={styles.flexRow}>
                    <p>How many persons fits comfortably in this room?</p>
                    <Input
                      name="measure_occupancy"
                      type="number"
                      placeholder="00"
                      min="0"
                      width={80}
                    />
                  </div>

                  <Select
                    instanceId="minRentalTime"
                    name="minimum_rental"
                    placeholder="Minimum rental time"
                    options={[
                      { value: "MINUTES_30", label: "30 Minutes" },
                      { value: "HOURS_1", label: "1 Hour" },
                      { value: "HOURS_2", label: "2 Hours" },
                      { value: "HOURS_3", label: "3 Hours" },
                      { value: "DAYS_1", label: "1 Day" },
                    ]}
                  />

                  <div className={styles.flexRow}>
                    <p>Scheduling timeframe:</p>
                    <div className={styles.radioContainer}>
                      <Radio
                        name="rental_timeframe"
                        options={[
                          { value: "MINUTES_15", label: "15 Minutes" },
                          { value: "MINUTES_30", label: "30 Minutes" },
                          { value: "HOURS_1", label: "1 Hour" },
                        ]}
                      />
                    </div>
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
                className={`${styles.formElements} ${
                  isConfigurationBlock ? styles.visible : styles.hidden
                }`}
              >
                <div>
                  <h4>
                    <strong>Extra Informations</strong> for this Service
                  </h4>
                  {questions?.map((question, index) => (
                    <div key={question.id} className={styles.flexRow}>
                      <p>{question.question}</p>
                      <div className={styles.radioContainer}>
                        <HiddenInput
                          name={`space_rules[${index}].meetroom_question_id`}
                          value={question.id}
                        />
                        <Radio
                          name={`space_rules[${index}].answer`}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4>
                    <strong>Pricing, Discounts &amp; Cancelations</strong>
                  </h4>

                  <div className={styles.flexRow}>
                    <p>Hourly room pricing:</p>
                    <Input
                      name="price"
                      placeholder="$0,000.00"
                      value={
                        amount?.price
                          ? Money({ amount: amount.price }).toFormat("$0,0.00")
                          : ""
                      }
                      onChange={handleDiscountChange("price")}
                      width={120}
                      className={styles.text__center}
                    />
                  </div>

                  <div className={styles.inputGroupContainer}>
                    <h5>Discounts for longer meeting rentals:</h5>
                    <div>
                      <div>
                        <label>Tree Hours Rental:</label>
                        <Input
                          name="discount_three"
                          placeholder="$0,000.00"
                          value={
                            amount?.three
                              ? Money({ amount: amount.three }).toFormat(
                                  "$0,0.00"
                                )
                              : ""
                          }
                          onChange={handleDiscountChange("three")}
                          className={styles.text__center}
                        />
                      </div>
                      <div>
                        <label>Half-Day Rental:</label>
                        <Input
                          name="discount_half"
                          placeholder="$0,000.00"
                          value={
                            amount?.half
                              ? Money({ amount: amount.half }).toFormat(
                                  "$0,0.00"
                                )
                              : ""
                          }
                          onChange={handleDiscountChange("half")}
                          className={styles.text__center}
                        />
                      </div>
                      <div>
                        <label>Full-Day Rental:</label>
                        <Input
                          name="discount_full"
                          placeholder="$0,000.00"
                          value={
                            amount?.full
                              ? Money({ amount: amount.full }).toFormat(
                                  "$0,0.00"
                                )
                              : ""
                          }
                          onChange={handleDiscountChange("full")}
                          className={styles.text__center}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.inputGroupContainer}>
                    <h5>
                      How many hours before the meeting to receive refunds:
                    </h5>
                    <div>
                      <div>
                        <label>Full Refund:</label>
                        <Input
                          name="cancelation_full"
                          type="number"
                          placeholder="00"
                        />
                      </div>
                      <div>
                        <label>half refund:</label>
                        <Input
                          name="cancelation_half"
                          type="number"
                          placeholder="00"
                        />
                      </div>
                      <div>
                        <label>No Refund:</label>
                        <Input
                          name="cancelation_no"
                          type="number"
                          placeholder="00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <Button
                type="button"
                text="ROOM CONFIGURATION"
                color="plain"
                className={`${styles.button__plain} ${
                  isConfigurationBlock ? styles.visible : styles.hidden
                }`}
                onClick={() => setIsConfigurationBlock(false)}
              />

              <Button
                type="submit"
                text={
                  !isConfigurationBlock
                    ? "CONTINUE CONFIGURATION"
                    : id
                    ? "UPDATE MEETING ROOM"
                    : "CREATE MEETING ROOM"
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

export default MeetingRoom;
MeetingRoom.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
