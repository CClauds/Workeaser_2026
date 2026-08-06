import { InputComponent } from "@components/FormElements/Input";
import Money from "dinero.js";
import React, { useContext, useMemo } from "react";
import { BookMeetroom } from "types";
import { StyledTable } from "@components/Table/StyledTable";
import {
  ActivitySection,
  BorderedSection,
  Content,
  InfosBlock,
  InfoSection,
  SummarySection,
} from "@styles/pages/relationship/agenda/single-booking/styles";
import { Row } from "@styles/reusable";
import { formatDateNew } from "@utils/numberFormat";
import { PaymentMethodsEnum } from "types/enums";
import { PriceList } from "./styles";
import { AuthContext } from "@contexts/AuthContext";
import { UserClient } from "types/user";

interface MeetroomProps {
  event: BookMeetroom;
}
export const Meetroom: React.FC<MeetroomProps> = ({ event }) => {
  const { user: loggedUser } = useContext(AuthContext) as { user: UserClient };
  const { user: fetchedUser, location, meetroom } = event;

  let user = {
    name: "",
    email: "",
    phone: "",
    company: "",
  };
  if (fetchedUser) {
    user = {
      name: `${fetchedUser.first_name} ${fetchedUser.last_name}`,
      email: fetchedUser.email,
      phone: fetchedUser.phone,
      company: fetchedUser.company_name,
    };
  } else if (loggedUser?.role === "CLIENT") {
    user = {
      name: `${loggedUser.first_name} ${loggedUser.last_name}`,
      email: loggedUser.email,
      phone: loggedUser.personal_phone,
      company: loggedUser.clientAccount.company_name,
    };
  }

  const columns = useMemo(() => {
    return [
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }) => formatDateNew(value),
      },
      {
        Header: "Room Name",
        accessor: "name",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
        className: "align__center",
        Cell: ({ value }) => value,
      },
      {
        Header: "Price",
        accessor: "price",
        className: "align__center",
        Cell: ({ value }: { value: number }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
      {
        Header: "Total Amount",
        accessor: "total_amount",
        className: "align__center",
        Cell: ({ value }: { value: number }) => (
          <span>{Money({ amount: value }).toFormat("$0,0.00")}</span>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () => [
      {
        date: event.date_start,
        name: meetroom.name,
        quantity: event.quantity_minutes / 60,
        price: event.price_per_hour,
        total_amount: event.amount_hours,
      },
    ],
    [event]
  );

  const formatDiscount = (value: number, method: string) => {
    if (method === "FIXED") {
      return Money({ amount: value }).toFormat("$0,0.00");
    }
    return `${Money({ amount: value }).toFormat("0.00")}%`;
  };

  return (
    <Content>
      <Row gap={15} align="stretch" wrap="wrap">
        <InfosBlock>
          <Row gap={15} align="stretch" wrap="wrap">
            <InfoSection>
              <div>
                <InputComponent value={user.name ?? "Not Informed"} readOnly />
              </div>
              <div>
                <InputComponent value={user.email ?? "Not Informed"} readOnly />
              </div>
              <div>
                <InputComponent value={user.phone ?? "Not Informed"} readOnly />
              </div>
              <div>
                <InputComponent
                  value={user.company ?? "Not Informed"}
                  readOnly
                />
              </div>
            </InfoSection>

            <InfoSection>
              <div>
                <InputComponent value={location.name} readOnly />
              </div>

              <Row gap={15}>
                <InputComponent
                  value={location.email ?? "Not informed"}
                  title={location.email ?? ""}
                  readOnly
                />
                <InputComponent
                  value={location.phone ?? "Not informed"}
                  readOnly
                />
              </Row>
              <div>
                <InputComponent
                  value={location.address?.fulltext ?? "Not informed"}
                  title={location.address?.fulltext ?? ""}
                  readOnly
                />
              </div>
              <div>
                <InputComponent
                  value={meetroom.name ?? "Not informed"}
                  title={meetroom.name ?? ""}
                  readOnly
                />
              </div>
            </InfoSection>
          </Row>

          <section>
            <StyledTable columns={columns} data={tableData ?? []} editable />
          </section>

          <Row gap={15} align="stretch" wrap="wrap">
            <BorderedSection>
              <header>
                <h3>Booking Notes:</h3>
              </header>
              <div>
                <p>{event.additional_information ?? "None"}</p>
              </div>
            </BorderedSection>

            <SummarySection>
              <PriceList>
                {event.fees?.map((tax) => (
                  <li key={tax.id}>
                    <p>{tax.name}</p>
                    <span>
                      <strong>{formatDiscount(tax.value, tax.method)}</strong>
                    </span>
                  </li>
                ))}
                {event.amount_discount > 0 && (
                  <li>
                    <p>Discount</p>
                    <span>
                      <strong>
                        <span>-</span>
                        {Money({ amount: event.amount_discount }).toFormat(
                          "$0,0.00"
                        )}
                      </strong>
                    </span>
                  </li>
                )}
                <li>
                  <p>Final Price</p>
                  <span>
                    <strong>
                      {Money({ amount: event.total }).toFormat("$0,0.00")}
                    </strong>
                  </span>
                </li>
                <hr />
                <div>
                  <p>Payment Method</p>
                  <span>
                    <strong>{PaymentMethodsEnum[event.payment_method]}</strong>
                  </span>
                </div>
              </PriceList>
            </SummarySection>
          </Row>
        </InfosBlock>

        <ActivitySection>
          <header>
            <h3>Booking Activity Track</h3>
          </header>
          {/* <ActivitiesSection>
                  <ActivityElement
                    title="Invoice Sent:"
                    text="Sent on"
                    date={invoice.date}
                    icon={
                      <svg width="21" height="21" viewBox="0 0 21 21">
                        <defs>
                          <clipPath>
                            <rect
                              width="21"
                              height="21"
                              transform="translate(-0.095 -0.095)"
                              fill="#2b3450"
                              stroke="#707070"
                              strokeWidth="1"
                            />
                          </clipPath>
                        </defs>
                        <g transform="translate(0.095 0.095)">
                          <g transform="translate(0 0.508)">
                            <path
                              d="M21.9,1.633a.508.508,0,0,1,.18.515l-4.515,19.3a.508.508,0,0,1-.748.325l-8.69-5,.506-.881,8.1,4.655L20.843,2.973l-18.5,9.306,3.938,2.263a.508.508,0,0,1-.506.881L1.017,12.689a.508.508,0,0,1,.025-.894L21.357,1.578A.508.508,0,0,1,21.9,1.633Z"
                              transform="translate(-0.762 -1.524)"
                              fill="#2b3450"
                              fillRule="evenodd"
                            />
                            <path
                              d="M14.092,7.6a.508.508,0,0,1-.041.717l-6.941,6.2v3.259l2.214-1.845a.508.508,0,1,1,.65.78L6.928,19.246a.508.508,0,0,1-.833-.39V14.285a.508.508,0,0,1,.17-.379l7.11-6.349A.508.508,0,0,1,14.092,7.6Z"
                              transform="translate(1.015 0.444)"
                              fill="#2b3450"
                              fillRule="evenodd"
                            />
                          </g>
                        </g>
                      </svg>
                    }
                  />

                  {!!invoice.historic.length && (
                    <ActivityElement
                      title="Invoice Payments:"
                      icon={
                        <svg width="21" height="21" viewBox="0 0 21 21">
                          <defs>
                            <clipPath>
                              <rect
                                width="21"
                                height="21"
                                transform="translate(-0.081 -0.095)"
                                fill="#2b3450"
                                stroke="#707070"
                                strokeWidth="1"
                              />
                            </clipPath>
                          </defs>
                          <g transform="translate(0.081 0.095)">
                            <g transform="translate(0 3.879)">
                              <path
                                d="M.727,5.091A1.454,1.454,0,0,1,2.182,3.636H20.6a1.454,1.454,0,0,1,1.454,1.454V15.756A1.454,1.454,0,0,1,20.6,17.211H2.182A1.454,1.454,0,0,1,.727,15.756Zm1.454-.485a.485.485,0,0,0-.485.485V15.756a.485.485,0,0,0,.485.485H20.6a.485.485,0,0,0,.485-.485V5.091a.485.485,0,0,0-.485-.485Z"
                                transform="translate(-0.727 -3.636)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                              <path
                                d="M7.906,7.366a4.111,4.111,0,0,0-.755,2.452,4.111,4.111,0,0,0,.755,2.452,2.116,2.116,0,0,0,1.669.942,2.116,2.116,0,0,0,1.669-.942A4.111,4.111,0,0,0,12,9.818a4.111,4.111,0,0,0-.755-2.452,2.116,2.116,0,0,0-1.669-.942A2.116,2.116,0,0,0,7.906,7.366Zm-.776-.582a3.08,3.08,0,0,1,2.445-1.33,3.08,3.08,0,0,1,2.445,1.33,5.077,5.077,0,0,1,.949,3.033,5.077,5.077,0,0,1-.949,3.033,3.08,3.08,0,0,1-2.445,1.33,3.08,3.08,0,0,1-2.445-1.33,5.077,5.077,0,0,1-.949-3.033A5.077,5.077,0,0,1,7.131,6.784Z"
                                transform="translate(1.09 -3.031)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                              <path
                                d="M1.091,6.424A2.424,2.424,0,0,0,3.515,4h.97A3.394,3.394,0,0,1,1.091,7.394Z"
                                transform="translate(-0.606 -3.515)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                              <path
                                d="M3.515,14.3a2.424,2.424,0,0,0-2.424-2.424v-.97A3.394,3.394,0,0,1,4.484,14.3Z"
                                transform="translate(-0.606 -1.213)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                              <path
                                d="M17.212,6.424A2.424,2.424,0,0,1,14.788,4h-.97a3.394,3.394,0,0,0,3.394,3.394Z"
                                transform="translate(3.635 -3.515)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                              <path
                                d="M14.788,14.3a2.424,2.424,0,0,1,2.424-2.424v-.97A3.394,3.394,0,0,0,13.818,14.3Z"
                                transform="translate(3.635 -1.213)"
                                fill="#2b3450"
                                fillRule="evenodd"
                              />
                            </g>
                          </g>
                        </svg>
                      }
                    >
                      {invoice.historic.map((item) => (
                        <PaymentElement key={item.payment_id}>
                          <p>
                            Payment ID: <strong>#{item.payment_id}</strong>
                          </p>
                          <p>
                            Paid{" "}
                            <strong>
                              {Money({ amount: item.amount }).toFormat(
                                "$0,0.00"
                              )}
                            </strong>{" "}
                            on{" "}
                            <strong>
                              <time>
                                {formatDate(new Date(item.created_at))}
                              </time>
                            </strong>
                          </p>
                        </PaymentElement>
                      ))}
                    </ActivityElement>
                  )}
                  {/* <ActivityElement
                  title="Payment Deposits:"
                  icon={
                    <svg width="21" height="21" viewBox="0 0 21 21">
                      <defs>
                        <clipPath>
                          <rect
                            width="21"
                            height="21"
                            transform="translate(-0.074 -0.095)"
                            fill="#2b3450"
                            stroke="#707070"
                            strokeWidth="1"
                          />
                        </clipPath>
                      </defs>
                      <g transform="translate(0.074 0.095)">
                        <g transform="translate(0 0.485)">
                          <path
                            d="M.727,3.394A1.939,1.939,0,0,1,2.666,1.455h.485a.485.485,0,0,1,0,.97H2.666a.97.97,0,0,0-.97.97v.97a.97.97,0,0,0,.97.97H17.21a.97.97,0,0,0,.97-.97v-.97a.97.97,0,0,0-.97-.97h-.485a.485.485,0,0,1,0-.97h.485A1.939,1.939,0,0,1,19.15,3.394v.97a1.93,1.93,0,0,1-.259.97h1.229a1.939,1.939,0,0,1,1.939,1.939V18.907a1.939,1.939,0,0,1-1.939,1.939H2.666A1.939,1.939,0,0,1,.727,18.907ZM1.7,6.043V18.907a.97.97,0,0,0,.97.97H20.119a.97.97,0,0,0,.97-.97V7.272a.97.97,0,0,0-.97-.97H2.666A1.93,1.93,0,0,1,1.7,6.043Z"
                            transform="translate(-0.727 -0.485)"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M11.636,9.939A1.939,1.939,0,0,1,13.576,8h4.363v.97H13.576a.97.97,0,0,0-.97.97v1.939a.97.97,0,0,0,.97.97h4.363v.97H13.576a1.939,1.939,0,0,1-1.939-1.939Z"
                            transform="translate(2.908 1.696)"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M7.515,1.7a3.64,3.64,0,0,0-3.58,4.278l-.955.17a4.606,4.606,0,1,1,9.068,0l-.955-.17A3.64,3.64,0,0,0,7.515,1.7Z"
                            transform="translate(0 -0.727)"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                          <path
                            d="M9.383,1.7a3.621,3.621,0,0,0-1.5.321l-.4-.883a4.609,4.609,0,0,1,6.431,5.01l-.955-.17A3.639,3.639,0,0,0,9.383,1.7Z"
                            transform="translate(1.525 -0.727)"
                            fill="#2b3450"
                            fillRule="evenodd"
                          />
                        </g>
                      </g>
                    </svg>
                  }
                >
                  <PaymentElement>
                    <p>
                      Payment ID: <strong>#0</strong>
                    </p>
                    <p>
                      Paid <strong></strong> on{" "}
                      <strong>
                        <time>{dateMask(invoice.date)}</time>
                      </strong>
                    </p>
                  </PaymentElement>
                </ActivityElement> 
                </ActivitiesSection> */}
        </ActivitySection>
      </Row>
    </Content>
  );
};
