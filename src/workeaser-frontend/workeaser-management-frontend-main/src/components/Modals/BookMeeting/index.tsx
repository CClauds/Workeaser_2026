import { Button } from "@components/Button";
import { CloseButton } from "@components/Button/CloseButton";
import { CloseModalButton } from "@components/Button/CloseModalButton";
import { DatePickerAntd } from "@components/Form/DatePickerAntd";
import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { TimeRangePicker } from "@components/Form/TimeRangePicker";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { FormHandles, SubmitHandler } from "@unform/core";
import { Form } from "@unform/web";
import dayjs, { Dayjs } from "dayjs";
import Money from "dinero.js";
import { useRouter } from "next/router";
import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { OptionType } from "types";
import { ClientsResponse } from "types/cowork/clients";
import {
  MeetingRoomResponse,
  MeetingRoomsResponse,
  Tax,
} from "types/cowork/locations/meetingRoom";
import { LocationData, MeetRoom } from "types/locations";
import * as Yup from "yup";
import styles from "./styles.module.scss";

interface FormData {
  client_uuid: string;
  companyName: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  location_id: number;
  meetroom_id: number;
  discount_type: string;
  discount_value: number;
  additional_information: string;
  meetroom_taxes: number;
  day: string;
  hourRange: string[];
  payment_method: string;
}

interface SelectedTax extends Tax {
  active?: boolean;
}
enum PaymentMethods {
  BENEFIT = "User Membership Benefit",
  BILLING = "Add to the Billing Cycle",
  CAPTURE = "Capture Payment",
  COURTESY = "Courtesy",
  PAY_SPACE = "Pay at the Space",
}
enum TimeframeEnum {
  MINUTES_15 = 15,
  MINUTES_30 = 30,
  HOURS_1 = 60,
}

interface BookMeetingProps {
  initialValue?: MeetRoom;
  isOpen: boolean;
  onRequestClose: () => void;
}
export const BookMeeting: React.FC<BookMeetingProps> = ({
  initialValue,
  isOpen,
  onRequestClose,
}) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<SelectedTax[]>([]);
  const [locationId, setLocationId] = useState<number>();
  const [meetingRoomId, setmeetingRoomId] = useState<number>();
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("NONE");
  const [finalPrice, setFinalPrice] = useState(0);

  const [allLocations, setAllLocations] = useState({
    data: [],
    pageCount: 1,
  });

  const [hourRange, setHourRange] = useState<[Dayjs, Dayjs]>(null);

  const formRef = useRef<FormHandles>(null);

  const { data: { result: clients } = {} } =
    useFetch<ClientsResponse>("/cowork/clients");

  let locationsUrl = `/cowork/locations?page=${allLocations.pageCount}`;
  const {
    data: { result: locations, pagination } = {},
    isLoading: locationsLoadiong,
  } = useFetch<LocationData>(locationsUrl);

  const { data: { result: meetingRooms } = {} } =
    useFetch<MeetingRoomsResponse>(
      locationId ? `/cowork/meetrooms?location=${locationId}` : null
    );
  const { data: { result: meetingRoom } = {} } = useFetch<MeetingRoomResponse>(
    meetingRoomId ? `/cowork/meetrooms/${meetingRoomId}` : null
  );

  let hours = calculateHoursDiff(hourRange);
  let meetingRoomPrice = meetingRoom?.price ?? 0;
  let basePrice = meetingRoomPrice * hours;

  const restoreInitialState = () => {
    setTaxes([]);
    setSelectedTaxes([]);
    setIsLoading(false);
    setLocationId(null);
    setDiscount(0);
    setFinalPrice(0);
    setmeetingRoomId(null);
  };

  useEffect(() => {
    if (isOpen) {
      restoreInitialState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialValue) {
      setmeetingRoomId(initialValue.id);
    }
  }, [initialValue]);

  useEffect(() => {
    if (locations) {
      const newLocations = [...allLocations.data, ...locations];
      setAllLocations((state) => ({ ...state, data: newLocations }));
    }
  }, [locations]);

  useEffect(() => {
    if (meetingRoom) {
      if (initialValue) {
        formRef.current?.setFieldValue("meetroom_id", {
          value: initialValue.id,
          label: initialValue.name,
        });
        formRef.current?.setFieldValue("location_id", meetingRoom.location_id);
      }
      setTaxes(meetingRoom.taxes);
    }
  }, [meetingRoom]);

  useEffect(() => {
    if (basePrice > 0) {
      let newPrice = Money({ amount: basePrice });

      if (discountType === "FIXED") {
        newPrice = newPrice.subtract(Money({ amount: discount }));
      } else if (discountType === "PERCENTAGE") {
        const subtractAmount = Money({ amount: basePrice })
          .percentage(discount / 100)
          .getAmount();
        newPrice = newPrice.subtract(Money({ amount: subtractAmount }));
      }

      selectedTaxes?.forEach((tax) => {
        if (tax.active) {
          if (tax.method === "FIXED") {
            newPrice = newPrice.add(Money({ amount: tax.value }));
          } else {
            const addAmount = Money({ amount: basePrice })
              .percentage(tax.value / 100)
              .getAmount();
            newPrice = newPrice.add(Money({ amount: addAmount }));
          }
        }
      });

      setFinalPrice(newPrice.getAmount() < 0 ? 0 : newPrice.getAmount());
    }
  }, [basePrice, discountType, discount, selectedTaxes]);

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        client_uuid: Yup.string().required(),
        location_id: Yup.string().required(),
        meetroom_id: Yup.string().required(),
        day: Yup.date().required(),
        hourRange: Yup.array().min(2),
        payment_method: Yup.string().required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const {
        day,
        hourRange,
        companyName,
        phone,
        email,
        firstName,
        lastName,
        meetroom_taxes,
        ...bodyData
      } = data;

      const body = {
        ...bodyData,
        discount_value: discount,
        taxes: selectedTaxes?.filter((tax) => tax.active),
        date_start: `${day} ${data.hourRange[0]}`,
        date_end: `${day} ${data.hourRange[1]}`,
      };

      const response = await api.post("/cowork/meetrooms/book", body);

      mutate("/cowork/relationship/bookings/unapproved");
      mutate("/cowork/relationship/bookings/scheduled");
      toast.success("Event added");
      setIsLoading(false);
      onRequestClose();
      if (bodyData.payment_method === "CAPTURE") {
        router.push(`/finances/invoices/${response.data.result.invoice_id}`);
      }
    } catch (err) {
      setIsLoading(false);

      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
      } else {
        if (Array.isArray(err?.response?.data?.error?.message)) {
          err?.response?.data.error.message.forEach((message) => {
            toast.error(message.message);
          });
        } else {
          toast.error(
            err?.response?.data?.error?.message ||
              "Unexpected error on try booking a meet"
          );
        }
      }
    }
  };

  const handleClientChange = (option: OptionType) => {
    if (option) {
      const client = clients.find((client) => client.uuid === option.value);
      formRef.current.setFieldValue("firstName", client.first_name);
      formRef.current.setFieldValue("lastName", client.last_name);
      formRef.current.setFieldValue("email", client.email);
      formRef.current.setFieldValue(
        "phone",
        client.personal_phone ?? "Not informed"
      );
      formRef.current.setFieldValue(
        "companyName",
        client?.clientAccount?.company_name
      );
    } else {
      formRef.current.clearField("firstName");
      formRef.current.clearField("lastName");
      formRef.current.clearField("email");
      formRef.current.clearField("phone");
      formRef.current.clearField("companyName");
    }
  };

  const handleLocationChange = (option: OptionType) => {
    if (option) setLocationId(Number(option.value));
  };

  const handleMeetingRoomChange = (option: OptionType) => {
    setmeetingRoomId(Number(option.value));
  };
  const handleTaxChange = (option: OptionType) => {
    const newTaxes = [...selectedTaxes];
    let selectedTax: SelectedTax = newTaxes?.find(
      (tax) => tax.name === option.label
    );

    setTaxes(taxes.filter((tax) => tax.name !== option.label));
    if (selectedTax) {
      selectedTax.active = true;
      setSelectedTaxes(newTaxes);
      return;
    }

    selectedTax = taxes?.find((tax) => tax.name === option.label);
    if (selectedTax) {
      selectedTax.active = true;
      setSelectedTaxes([...selectedTaxes, selectedTax]);
    }
  };

  const handleTaxDelete = (name: string) => {
    const deletedTax = meetingRoom?.taxes?.find((tax) => tax.name === name);
    setTaxes([...taxes, deletedTax]);

    const newFees = [...selectedTaxes];
    const index = newFees.findIndex((fee) => fee.name === name);
    newFees[index].active = false;
    setSelectedTaxes(newFees);
  };

  const handleDiscountTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDiscountType(value);
    if (value === "PERCENTAGE") {
      if (discount > 10000) {
        setDiscount(10000);
        return;
      }
    }
  };

  const handleDiscountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const number = value.replace(/\$|,|\.|%/g, "");
    if (!number) {
      setDiscount(0);
      return;
    }
    if (discountType === "PERCENTAGE") {
      if (parseInt(number) < 0 || parseInt(number) > 10000) {
        return;
      }
    }
    setDiscount(parseInt(number, 10) ?? 0);
  };

  const handleAmountKeyup = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && discountType === "PERCENTAGE") {
      const amountString = Money({ amount: discount }).toFormat("0.00");
      const number = amountString.replace(/\$|,|\.|%/g, "");
      const value = number.slice(0, -1);
      setDiscount(parseInt(value, 10) ?? 0);
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
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <>
        <header>
          <h1>Book a Meeting</h1>
        </header>

        <Form
          ref={formRef}
          onSubmit={handleSubmit}
          initialData={{ discount_type: "NONE", dayPicker: new Date() }}
          className={styles.formContainer}
        >
          <div className={styles.formContent}>
            <section>
              <Select
                instanceId="client_uuid"
                name="client_uuid"
                placeholder="Pull Client Information with the ID or Email"
                onChange={handleClientChange}
                isLoading={!clients}
                options={clients?.map((client) => ({
                  value: client.uuid,
                  label: client.first_name,
                  photo: client.photo?.file,
                  first_name: client.first_name,
                  last_name: client.last_name,
                  company_name: client?.clientAccount?.company_name,
                  email: client.email,
                  personal_phone: client.personal_phone,
                }))}
                formatType="user"
              />
              <div className={styles.row}>
                <Input name="firstName" placeholder="First Name" readOnly />
                <Input name="lastName" placeholder="Last Name" readOnly />
              </div>
              <div className={styles.row}>
                <Input name="email" placeholder="Email" readOnly />
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Phone"
                  mask="phone"
                  readOnly
                />
              </div>

              <Input name="companyName" placeholder="Company Name" readOnly />

              <Select
                instanceId="location_id"
                name="location_id"
                placeholder="Select the Location"
                isClearable={false}
                onChange={handleLocationChange}
                isDisabled={!!initialValue}
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
              <Select
                instanceId="meetroom_id"
                name="meetroom_id"
                placeholder="Select the Meeting Room"
                isClearable={false}
                onChange={handleMeetingRoomChange}
                isDisabled={!meetingRooms || !!initialValue}
                options={meetingRooms?.map((meetingRoom) => ({
                  value: meetingRoom.id,
                  label: meetingRoom.name,
                  photo: meetingRoom.photos[0],
                  name: meetingRoom.name,
                  location: meetingRoom.location,
                }))}
                formatType="services"
              />
              <div
                className={`${styles.datetimeContainer} ${
                  !meetingRoomId ? styles.disabled : ""
                }`}
              >
                <DatePickerAntd
                  name="day"
                  disabled={!meetingRoomId}
                  disabledDate={(current) => {
                    return (
                      current && current < dayjs().add(-1, "d").endOf("day")
                    );
                  }}
                />
                <TimeRangePicker
                  name="hourRange"
                  value={hourRange}
                  onChange={setHourRange}
                  disabled={!meetingRoomId}
                  minuteStep={
                    TimeframeEnum[meetingRoom?.rental_timeframe] ?? 10
                  }
                />
              </div>
            </section>
            <section>
              <div className={styles.row}>
                <p>Any discount?</p>
                <Radio
                  name="discount_type"
                  onChange={handleDiscountTypeChange}
                  options={[
                    {
                      value: "NONE",
                      label: "No",
                    },
                    { value: "FIXED", label: "Fixed Value" },
                    {
                      value: "PERCENTAGE",
                      label: "Percentage",
                    },
                  ]}
                />
              </div>
              <div className={styles.row}>
                <label htmlFor="discount">
                  Discount amount (only numbers):
                </label>
                <Input
                  id="discount"
                  name="discount_value"
                  value={
                    discountType === "NONE"
                      ? ""
                      : discountType === "FIXED"
                      ? Money({ amount: discount }).toFormat("$0,0.00")
                      : `${Money({ amount: discount }).toFormat("0.00")}%`
                  }
                  onChange={handleDiscountChange}
                  onKeyUp={handleAmountKeyup}
                  extraClass={styles.numberInput}
                  disabled={discountType === "NONE"}
                  width={125}
                />
              </div>

              <Textarea
                name="additional_information"
                placeholder="Additional Information"
                extraClass={styles.textarea}
              />

              <Select
                instanceId="meetroom_taxes"
                name="meetroom_taxes"
                placeholder="Select Fees &amp; Taxes"
                isClearable={false}
                onChange={handleTaxChange}
                isDisabled={!meetingRoom}
                options={taxes?.map((tax) => ({
                  value: tax.id,
                  label: tax.name,
                  taxName: tax.name,
                  taxMethod: tax.method,
                }))}
                formatType="taxes"
              />

              <div className={styles.priceContainer}>
                <h2>Booking Price</h2>

                <ul>
                  <li className={styles.open}>
                    <p>
                      {hours} Hours x{" "}
                      {Money({ amount: meetingRoom?.price ?? 0 }).toFormat(
                        "$0,0.00"
                      )}
                    </p>
                    <span>
                      {Money({ amount: Number(basePrice || 0) }).toFormat(
                        "$0,0.00"
                      )}
                    </span>
                  </li>
                  {selectedTaxes.map((tax) => (
                    <li
                      key={tax.name}
                      className={tax.active ? styles.open : styles.close}
                    >
                      <CloseButton onClick={() => handleTaxDelete(tax.name)} />

                      <p>{tax.name}</p>

                      <span>
                        {tax.method === "FIXED"
                          ? Money({ amount: tax.value }).toFormat("$0,0.00")
                          : `${Money({ amount: tax.value }).toFormat("0.00")}%`}
                      </span>
                    </li>
                  ))}
                  <li
                    className={
                      discountType !== "NONE" ? styles.open : styles.close
                    }
                  >
                    <p>Discount</p>
                    <span>
                      {discountType === "FIXED"
                        ? Money({ amount: discount }).toFormat("$0,0.00")
                        : `${Money({ amount: discount }).toFormat("0.00")}%`}
                    </span>
                  </li>
                  <li>
                    <p>Final Price</p>
                    <span>
                      {Money({ amount: finalPrice }).toFormat("$0,0.00")}
                    </span>
                  </li>
                </ul>
              </div>

              <Select
                instanceId="payment_method"
                name="payment_method"
                placeholder="Select the Payment Method"
                isClearable={false}
                options={Object.keys(PaymentMethods).map((method) => ({
                  value: method,
                  label: PaymentMethods[method],
                }))}
              />
            </section>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              text="PROCEED WITH BOOKING"
              type="submit"
              loading={isLoading}
              extraClass={isLoading ? styles.loading : ""}
            />
          </div>
        </Form>
      </>
    </Modal>
  );
};

const calculateHoursDiff = (hourRange: [Dayjs, Dayjs]): number => {
  if (!hourRange) return 0;
  return (
    Math.round(
      ((hourRange[1].valueOf() - hourRange[0].valueOf()) / 36e5) * 100
    ) / 100
  );
};
