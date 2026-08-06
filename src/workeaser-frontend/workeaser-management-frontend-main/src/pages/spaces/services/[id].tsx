import { Button } from "@components/Button";
import { BookDaypassModal } from "@components/Client/Modals/BookDaypassModal";
import { BookTourModal } from "@components/Client/Modals/BookTourModal";
import { Collapsible } from "@components/Collapsible";
import { CoworkingCard } from "@components/Coworking/CoworkingCard";
import { Calendar } from "@components/Form/Calendar";
import { Checkbox } from "@components/Form/Checkbox";
import { Radio } from "@components/Form/Radio";
import { Select } from "@components/Form/Select";
import { Textarea } from "@components/Form/Textarea";
import { TimeRangePicker } from "@components/Form/TimeRangePicker";
import { Icomoon } from "@components/Icomoon";
import { Help } from "@components/Icons";
import { CircledArrowIcon } from "@components/Icons/CircledArrowIcon";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { PulicLayout } from "@components/Layouts/PulicLayout";
import { GalleryModal } from "@components/Modals/GalleryModal";
import { ImagesCarousel } from "@components/Spaces/ImagesCarousel";
import { SpaceHeader } from "@components/Spaces/SpaceHeader";
import { Thumbnail } from "@components/Thumbnail";
import { CustomTooltip } from "@components/Tooltip/Custom";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import {
  AmenitiesGrid,
  AmenityCard,
  Blur,
  Carousel,
  Container,
  Content,
  ContentContainer,
  FeesContainer,
  FeesContent,
  MapContainer,
  MapSubtitle,
  OtherServicesContainer,
  PricingCard,
  PricingContainer,
  PricingContent,
  Sidebar,
  SidebarForm,
  SidebarHeader,
} from "@styles/pages/spaces/single/styles";
import { Row } from "@styles/reusable";
import { FormHandles, SubmitHandler } from "@unform/core";
import {
  capitalizeFirstLetter,
  toLocalIsoDate,
  toLocalIsotime,
} from "@utils/helpers";
import Money from "dinero.js";
import { FeatureCollection } from "geojson";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PagesProps } from "pages/_app";
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Map, { CircleLayer, Layer, Source } from "react-map-gl";
import { toast } from "react-toastify";
import { useTheme } from "styled-components";
import {
  AmenitiesIconsEnum,
  PaymentMethodsEnum,
  ServicesAbbrEnum,
  ServicesUrlEnum,
  TermSizeEnum,
} from "types/enums";
import { OptionType } from "types/form";
import { Service } from "types/infos";
import { SpaceResponse } from "types/spaces";
import { User } from "types/user";
import * as Yup from "yup";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apiClient = getAPIClient(context);

  const { id } = context.params;
  const { serviceType } = context.query;

  const userPromise = apiClient.get("/me");
  const spacePromise = apiClient.get<SpaceResponse>(
    `/spaces/${ServicesUrlEnum[serviceType as string]}/${id}`
  );
  const servicePromise = apiClient.get("/infos/services");

  const [userResponse, spaceResponse, servicesResponse] =
    await Promise.allSettled([userPromise, spacePromise, servicePromise]);

  let users = null;

  if (userResponse.status === "fulfilled") {
    users = userResponse.value.data.result;
  }

  // @ts-ignore
  // prettier-ignore
  const { data: { result: services } } = servicesResponse.value;
  // @ts-ignore
  // prettier-ignore
  const { data: space} = spaceResponse.value;

  return {
    props: {
      user: users ? users[0] : null,
      id,
      serviceType,
      space,
      services,
    },
  };
};

interface FormSpaceData {
  term_size: string;
  auto_renewal: string;
  payment_recurring_style: string;
  confirmation: boolean;
}
interface FormMeetingData {
  hourRange: [string, string];
  dayPicker: Date;
}

enum AutoRenewalEnum {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}
enum RecurringPaymentEnum {
  MONTHLY = "Monthly",
  TOTAL = "Total",
}
export enum TermSizeFriednlyEnum {
  MONTH_1 = "1 month",
  MONTH_3 = "3 months",
  MONTH_6 = "6 months",
  YEAR_1 = "1 year",
  YEAR_2 = "2 years",
  YEAR_3 = "3 years",
}

interface SingleSpaceProps {
  user: User;
  id: number;
  serviceType: string;
  space: SpaceResponse;
  services: Service[];
}
const SingleSpace = ({
  user,
  id,
  serviceType,
  space,
  services,
}: SingleSpaceProps) => {
  const { result: spaceData } = space;
  const { location_id } = spaceData;

  const theme = useTheme();
  const router = useRouter();

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isDaypassModalOpen, setIsDaypassModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState("ACTIVE");
  const [recurringPayments, setRecurringPayments] = useState("MONTHLY");
  const [termSize, setTermSize] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: spaceData.address.longitude,
    latitude: spaceData.address.latitude,
    zoom: 14,
  });
  const [pricingCollapse, setPricingCollapse] = useState(true);
  const [feesCollapse, setFeesCollapse] = useState(true);
  const [discountsCollapse, setDiscountsCollapse] = useState(true);
  const [paymentRecurringDisabled, setPaymentRecurringDisabled] =
    useState(false);
  const [additionalInfos, setAdditionalInfos] = useState("");
  const [photos, setPhotos] = useState(spaceData.photos);
  const [tooltipsActive, setTooltipsActive] = useState<number[]>([]);

  const formRef = useRef<FormHandles>(null);

  useEffect(() => {
    let shiftQuantity = 1;
    if (spaceData.photos.length > 4) {
      shiftQuantity = 2;
    }
    setPhotos(shiftPhotoArray(spaceData.photos, 1, shiftQuantity));

    setTermSize("");
    setConfirmation(false);
    setAutoRenewal("ACTIVE");
    setRecurringPayments("MONTHLY");
    setViewState({
      ...viewState,
      longitude: spaceData.address.longitude,
      latitude: spaceData.address.latitude,
    });

    formRef.current?.reset();
    formRef.current?.setData({
      auto_renewal: "ACTIVE",
      payment_recurring_style: "MONTHLY",
    });
  }, [router.asPath]);

  const handleFormSubmit: SubmitHandler = async (data, { reset }) => {
    if (serviceType === "MEETING_ROOM") {
      submitMeetingRoom(data, reset);
    } else {
      submitContract(data);
    }
  };

  const submitContract = async (data: FormSpaceData) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        term_size: Yup.string().required("Term size is required."),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const body = {
        ...data,
        auto_renewal: data.auto_renewal === "ACTIVE" ? true : false,
        location_id,
        resource_id: id,
        service_type: serviceType,
      };

      const response = await api.post("/client/spaces/reserve", body);
      // console.log({ response });
      toast.success("Request sent.");
      formRef.current.clearField("confirmation");
      setConfirmation(false);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
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

  const submitMeetingRoom = async (
    data: FormMeetingData,
    reset: (data?: Record<string, any>) => void
  ) => {
    try {
      formRef.current.setErrors({});

      const schema = Yup.object().shape({
        hourRange: Yup.array().min(2),
        payment_method: Yup.string().required(),
      });
      await schema.validate(data, {
        abortEarly: false,
      });

      setIsLoading(true);

      const day = data.dayPicker.toDateString();

      const body = {
        ...data,
        location_id,
        meetroom_id: id,
        date_start: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[0]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[0]}`))}`,
        date_end: `${toLocalIsoDate(
          new Date(`${day} ${data.hourRange[1]}`)
        )} ${toLocalIsotime(new Date(`${day} ${data.hourRange[1]}`))}`,
      };

      const response = await api.post("/client/meeting/request", body);
      // console.log({ response });
      toast.success("Request sent.");
      reset();
      setConfirmation(false);
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
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

  const cards = spaceData.other_services?.map((service) => ({
    id: service.id,
    title: service.name,
    subTitle: spaceData.service_name,
    photo: service?.photo ?? null,
    services: [ServicesAbbrEnum[service.service_type]],
    serviceType: service.service_type,
    priceType: service.price_type,
    price: service.price,
  }));

  const geojson: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [
            spaceData.address.longitude,
            spaceData.address.latitude,
          ],
        },
      },
    ],
  };

  const layerStyle: CircleLayer = {
    id: "point",
    type: "circle",
    paint: {
      "circle-radius": 8,
      "circle-color": theme.colors.blue200,
    },
  };

  const handleTermSizeChange = (option: OptionType) => {
    setPaymentRecurringDisabled(false);
    if (option) {
      setTermSize(option.value as string);

      const pricing = spaceData.contract_pricing.find(
        (price) => price.term_size === option.value
      );

      if (!pricing.payment_month) {
        formRef.current.setFieldValue("payment_recurring_style", "TOTAL");
        setRecurringPayments("TOTAL");
        setPaymentRecurringDisabled(true);
        return;
      }
      if (!pricing.payment_full) {
        formRef.current.setFieldValue("payment_recurring_style", "MONTHLY");
        setRecurringPayments("MONTHLY");
        setPaymentRecurringDisabled(true);
        return;
      }
    }
  };

  const handlePaymentRecurringChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setRecurringPayments(value);
  };

  const setContractPricing = () => {
    const pricing = spaceData.contract_pricing.find(
      (price) => price.term_size === termSize
    );
    if (!pricing) {
      return "";
    }

    if (recurringPayments === "MONTHLY") {
      return Money({ amount: pricing.payment_month }).toFormat("$0,0.00");
    }
    return Money({ amount: pricing.payment_full }).toFormat("$0,0.00");
  };
  const setContractInitialFee = () =>
    Money({
      amount: spaceData?.fees.reduce(
        (total, fee) => total + Number(fee.amount),
        0
      ),
    }).toFormat("$0,0.00");

  const onMove = useCallback((evt) => {
    setViewState({
      ...evt.viewState,
    });
  }, []);

  const handleGalleryChange = (direction: number, index = 1) => {
    setPhotos(shiftPhotoArray(photos, direction, index));
  };
  const handleGalleryOpen = (index: number) => {
    setIsGalleryModalOpen(true);
    if (index === 1) {
      handleGalleryChange(-1);
    } else if (index === 2) {
      handleGalleryChange(-1, 2);
    }
  };

  const tooltipMouseEnter = (index: number) => () => {
    setTooltipsActive([...tooltipsActive, index]);
  };
  const tooltipMouseLeave = () => {
    setTooltipsActive([]);
  };

  return (
    <>
      <Head>
        <title>{spaceData.coworking_name} | Workeaser</title>
      </Head>

      <Container>
        <SpaceHeader
          logoUrl={spaceData.coworking_logo}
          name={spaceData.coworking_name}
          address={
            spaceData.address?.short_address || spaceData.address.fulltext
          }
        />

        <Carousel itemsQuantity={spaceData.photos.length}>
          <div>
            <ImagesCarousel
              photos={photos}
              onGalleryChange={handleGalleryChange}
              onImageClick={handleGalleryOpen}
            />
          </div>
        </Carousel>

        <ContentContainer>
          <section>
            <Content>
              <h3>About {spaceData.service_name}:</h3>

              <p className="description">{spaceData.description}</p>

              {serviceType !== "MEETING_ROOM" && (
                <PricingContainer isCollapsed={pricingCollapse}>
                  <div
                    className="header"
                    onClick={() => setPricingCollapse(!pricingCollapse)}
                  >
                    <p>CONTRACT PRICING BY TERMS</p>
                    <CircledArrowIcon />
                  </div>
                  <Collapsible collapse={pricingCollapse}>
                    <PricingContent>
                      <div>
                        <p>Available Term Sizes</p>
                        <div>
                          <p>Month by Month</p>
                          <p>Contract-Length</p>
                        </div>
                      </div>
                      {spaceData.contract_pricing?.map((pricing) => (
                        <div key={pricing.term_size} className="pricing__card">
                          <p>{TermSizeEnum[pricing.term_size]}</p>
                          <div>
                            <p>
                              {pricing.payment_month === 0
                                ? "Not offered"
                                : Money({
                                    amount: pricing.payment_month,
                                  }).toFormat("$0,0.00")}
                            </p>
                            <p>
                              {pricing.payment_full === 0
                                ? "Not offered"
                                : Money({
                                    amount: pricing.payment_full,
                                  }).toFormat("$0,0.00")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </PricingContent>
                  </Collapsible>
                </PricingContainer>
              )}
            </Content>

            <Content>
              <h3>Our {spaceData.coworking_name} Space:</h3>

              <p className="description">{spaceData.location_description}</p>

              <AmenitiesGrid>
                {spaceData.amenities.map((item) => (
                  <AmenityCard key={item.id}>
                    <Icomoon
                      iconName={AmenitiesIconsEnum[item.id]}
                      fontSize={22}
                    />
                    <span>{item.name}</span>
                  </AmenityCard>
                ))}
              </AmenitiesGrid>
            </Content>

            <Content>
              <h3>Directions:</h3>
              <MapContainer>
                <Map
                  {...viewState}
                  onMove={onMove}
                  mapStyle="mapbox://styles/mapbox/streets-v9"
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
                >
                  <Source id="my-data" type="geojson" data={geojson}>
                    <Layer {...layerStyle} />
                  </Source>
                </Map>
              </MapContainer>
              <MapSubtitle>{spaceData.address.fulltext}</MapSubtitle>
            </Content>
          </section>

          <section>
            <Sidebar>
              <SidebarHeader>
                {spaceData.space_host_photo && (
                  <Thumbnail
                    fullUrl={spaceData.space_host_photo}
                    alt="host picture"
                    size={85}
                    radius={5}
                  />
                )}
                <h4>{spaceData.space_host_name}</h4>
                <p>Space Host</p>
              </SidebarHeader>

              <SidebarForm
                ref={formRef}
                onSubmit={handleFormSubmit}
                initialData={
                  serviceType === "MEETING_ROOM"
                    ? {
                        additional_information: "",
                      }
                    : {
                        auto_renewal: "ACTIVE",
                        payment_recurring_style: "MONTHLY",
                      }
                }
              >
                <h4>{spaceData.service_name}</h4>

                {serviceType !== "MEETING_ROOM" ? (
                  <>
                    <Row justify="space-between">
                      <label>Contract term size:</label>

                      <Select
                        instanceId="term_size"
                        name="term_size"
                        placeholder="Length"
                        isClearable={false}
                        width={150}
                        onChange={handleTermSizeChange}
                        options={spaceData.contract_pricing?.map((term) => ({
                          value: term.term_size,
                          label: capitalizeFirstLetter(
                            TermSizeEnum[term.term_size]
                          ),
                        }))}
                      />
                    </Row>
                    <Row justify="space-between">
                      <label>Auto-Renewal:</label>

                      <Radio
                        name="auto_renewal"
                        onChange={(e) => setAutoRenewal(e.currentTarget.value)}
                        options={[
                          { value: "ACTIVE", label: "Active" },
                          {
                            value: "INACTIVE",
                            label: "Inactive",
                          },
                        ]}
                      />
                    </Row>
                    <Row justify="space-between">
                      <label>Recurring Payments:</label>

                      <Radio
                        name="payment_recurring_style"
                        disabled={paymentRecurringDisabled}
                        onChange={handlePaymentRecurringChange}
                        options={[
                          { value: "MONTHLY", label: "Monthly" },
                          {
                            value: "TOTAL",
                            label: "Contract-Length",
                          },
                        ]}
                      />
                    </Row>

                    <div className="container__border">
                      <Collapsible collapse={!termSize}>
                        <h5>Service Summary:</h5>
                        <p className="justified__text">
                          You are contracting{" "}
                          <strong>{spaceData.service_name}</strong> from{" "}
                          <strong>{spaceData.coworking_name}</strong> for{" "}
                          <strong>{TermSizeFriednlyEnum[termSize]}</strong> with
                          an <strong>{AutoRenewalEnum[autoRenewal]}</strong>{" "}
                          auto-renewal. In this contract you will be paying the
                          service provider the{" "}
                          <strong>
                            {RecurringPaymentEnum[recurringPayments]}
                          </strong>{" "}
                          amount of <strong>{setContractPricing()}</strong>. To
                          move forward, the service provider requires an amount
                          fo $ <strong>{setContractInitialFee()}</strong> as
                          initial fees.
                        </p>

                        {!!spaceData.fees.length && (
                          <FeesContainer isCollapsed={feesCollapse}>
                            <div
                              className="header"
                              onClick={() => setFeesCollapse(!feesCollapse)}
                            >
                              <p>INITIAL FEES</p>
                              <CircledArrowIcon />
                            </div>

                            <Collapsible collapse={feesCollapse}>
                              <FeesContent>
                                <div>
                                  <p>Name</p>
                                  <p>Amount</p>
                                </div>
                                {spaceData.fees?.map((fee, index) => (
                                  <PricingCard key={fee.id}>
                                    <div>
                                      <div
                                        onMouseEnter={tooltipMouseEnter(index)}
                                        onMouseLeave={tooltipMouseLeave}
                                      >
                                        <Help
                                          size={18}
                                          color={theme.colors.blue200}
                                        />
                                        <CustomTooltip
                                          isActive={
                                            tooltipsActive.indexOf(index) >= 0
                                          }
                                        >
                                          <p>{fee.description}</p>
                                        </CustomTooltip>
                                      </div>
                                      <p>{fee.name}</p>
                                    </div>
                                    <p>
                                      {Money({
                                        amount: parseInt(fee.amount),
                                      }).toFormat("$0,0.00")}
                                    </p>
                                  </PricingCard>
                                ))}
                              </FeesContent>
                            </Collapsible>
                          </FeesContainer>
                        )}

                        <PricingCard>
                          <p className="small regular">
                            Annual Price Adjustment
                          </p>
                          <p className="small">
                            {`${Money({
                              amount: spaceData?.renewal_tax ?? 0,
                            }).toFormat("0.00")}%`}
                          </p>
                        </PricingCard>
                        <div>
                          <Checkbox
                            name="confirmation"
                            value="confirmation"
                            onChange={(e) =>
                              setConfirmation(e.currentTarget.checked)
                            }
                          >
                            I agree with the terms above
                          </Checkbox>
                        </div>
                        <Button
                          type="submit"
                          text="PROCEED"
                          loading={isLoading}
                          disabled={!confirmation}
                        />
                      </Collapsible>
                    </div>
                  </>
                ) : (
                  <>
                    <Calendar name="dayPicker" />

                    <Row justify="space-between">
                      <label>Hour Range:</label>
                      <TimeRangePicker name="hourRange" />
                    </Row>

                    <FeesContainer isCollapsed={discountsCollapse}>
                      <div
                        className="header"
                        onClick={() => setDiscountsCollapse(!discountsCollapse)}
                      >
                        <p>Discounts</p>
                        <CircledArrowIcon />
                      </div>
                      <Collapsible collapse={discountsCollapse}>
                        <FeesContent>
                          <div>
                            <p>Discount</p>
                            <p>Amount</p>
                          </div>

                          <PricingCard>
                            <p>Tree Hours Rental</p>

                            <p>
                              {Money({
                                amount: spaceData.discount_three,
                              }).toFormat("$0,0.00")}
                            </p>
                          </PricingCard>
                          <PricingCard>
                            <p>Half-Day Rental</p>

                            <p>
                              {Money({
                                amount: spaceData.discount_half,
                              }).toFormat("$0,0.00")}
                            </p>
                          </PricingCard>
                          <PricingCard>
                            <p>Full-Day Rental</p>

                            <p>
                              {Money({
                                amount: spaceData.discount_full,
                              }).toFormat("$0,0.00")}
                            </p>
                          </PricingCard>
                        </FeesContent>
                      </Collapsible>
                    </FeesContainer>
                    <FeesContainer isCollapsed={feesCollapse}>
                      <div
                        className="header"
                        onClick={() => setFeesCollapse(!feesCollapse)}
                      >
                        <p>Cancelation &amp; Refunds</p>
                        <CircledArrowIcon />
                      </div>
                      <Collapsible collapse={feesCollapse}>
                        <FeesContent>
                          <div>
                            <p>Refund</p>
                            <p>Amount</p>
                          </div>

                          <PricingCard>
                            <p>Full refund</p>

                            <p>
                              {spaceData.cancelation_full}h
                              {/* {Money({
                                      amount: parseInt(),
                                    }).toFormat("$0,0.00")} */}
                            </p>
                          </PricingCard>
                          <PricingCard>
                            <p>Half refund</p>

                            <p>
                              {spaceData.cancelation_half}h
                              {/* {Money({
                                      amount: parseInt(),
                                    }).toFormat("$0,0.00")} */}
                            </p>
                          </PricingCard>
                          <PricingCard>
                            <p>No refund</p>

                            <p>
                              {spaceData.cancelation_no}h
                              {/* {Money({
                                      amount: parseInt(),
                                    }).toFormat("$0,0.00")} */}
                            </p>
                          </PricingCard>
                        </FeesContent>
                      </Collapsible>
                    </FeesContainer>

                    <Select
                      instanceId="payment_method"
                      name="payment_method"
                      placeholder="Select the Payment Method"
                      isClearable={false}
                      options={Object.keys(PaymentMethodsEnum).map(
                        (method) => ({
                          value: method,
                          label: PaymentMethodsEnum[method],
                        })
                      )}
                    />

                    <Textarea
                      name="additional_information"
                      placeholder="Additional Information"
                      height={75}
                      autoComplete="off"
                      value={additionalInfos}
                      onChange={(e) =>
                        setAdditionalInfos(e.currentTarget.value)
                      }
                    />
                    {/* 
                    <Row>
                      <Checkbox
                        name="confirmation"
                        value="confirmation"
                        onChange={(e) =>
                          setConfirmation(e.currentTarget.checked)
                        }
                      >
                        I agree with the terms above
                      </Checkbox>
                    </Row> */}
                    <Button
                      type="submit"
                      text="PROCEED"
                      loading={isLoading}
                      // disabled={!confirmation}
                    />
                  </>
                )}
              </SidebarForm>

              <div className="sidebar__footer">
                <Button
                  text="SCHEDULE A TOUR"
                  color="secondary"
                  onClick={() => setIsTourModalOpen(true)}
                />
                <Button
                  text="Get a Day Pass"
                  color="secondary"
                  onClick={() => setIsDaypassModalOpen(true)}
                  disabled={
                    serviceType === "MEETING_ROOM" ||
                    serviceType === "VIRTUAL_OFFICE"
                  }
                />
              </div>

              {user?.role !== "CLIENT" && (
                <Blur>
                  <span>Restricted Access for Coworker Accounts.</span>
                </Blur>
              )}
            </Sidebar>
          </section>
        </ContentContainer>

        <OtherServicesContainer>
          <h3>Other services from {spaceData.coworking_name}:</h3>
          <div className="cards__container">
            {cards.map((card) => (
              <CoworkingCard
                key={`${card.id}-${card.serviceType}`}
                coworking={card}
                services={services}
                onClickLink={`/spaces/services/${card.id}?serviceType=${card.serviceType}`}
              />
            ))}
          </div>
        </OtherServicesContainer>
      </Container>

      <BookTourModal
        resource={{
          locationId: location_id,
          name: spaceData.service_name,
        }}
        services={services}
        isOpen={isTourModalOpen}
        onRequestClose={() => setIsTourModalOpen(false)}
      />
      <BookDaypassModal
        resource={{
          locationId: location_id,
          id,
          name: spaceData.service_name,
          type: serviceType,
        }}
        isOpen={isDaypassModalOpen}
        onRequestClose={() => setIsDaypassModalOpen(false)}
      />

      <GalleryModal
        isOpen={isGalleryModalOpen}
        photos={photos}
        onRequestClose={() => setIsGalleryModalOpen(false)}
        onGalleryChange={handleGalleryChange}
      />
    </>
  );
};

SingleSpace.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  const {
    props: {
      children: { props },
    },
  } = page;
  const { user } = props;

  if (!user) {
    return <PulicLayout>{page}</PulicLayout>;
  }
  if (user?.role === "CLIENT") {
    return <ClientLayout componentProps={componentProps}>{page}</ClientLayout>;
  }
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default SingleSpace;

const shiftPhotoArray = (
  array: string[],
  direction?: number,
  index = 1
): string[] => {
  const newArray = [...array];
  if (direction === 1) {
    for (let i = 0; i < index; i++) {
      const lastItem = newArray.pop();
      newArray.unshift(lastItem);
    }
  } else if (direction === -1) {
    for (let i = 0; i < index; i++) {
      const firstItem = newArray.shift();
      newArray.push(firstItem);
    }
  }

  return newArray;
};
