import { CloseModalButton } from "@components/Button/CloseModalButton";
import { DotsMenuButton } from "@components/Button/DotsMenuButton";
import { InputComponent } from "@components/FormElements/Input";
import { TextAreaComponent } from "@components/FormElements/Textarea";
import { Loader } from "@components/Loader";
import { useFetch } from "@hooks/useFetch";
import { Row } from "@styles/reusable";
import { formatDateExtendMonth, formatTime } from "@utils/numberFormat";
import Money from "dinero.js";
import React, { useContext } from "react";
import Modal from "react-modal";
import { ThemeContext } from "styled-components";
import { GenericBooking } from "types/cowork/relationship";
import {
  BookingTypeEnum,
  PaymentMethodsEnum,
} from "types/cowork/relationship/enums";
import { ServiceTypeEnum } from "types/enums";
import {
  ButtonsContainer,
  Container,
  DatetimeContainer,
  Form,
  LoaderContainer,
  SectionDivider,
  TimeContainer,
} from "./styles";

interface ViewBookingModalProps {
  type?: "schedule" | "agenda";
  event?: GenericBooking;
  onApproveClick: (id: number, type: string) => void;
  onNegotiateClick: (id: number, type: string) => void;
  onRejectClick: (id: number, type: string) => void;
  isOpen: boolean;
  onRequestClose: () => void;
}

export const ViewBookingModal: React.FC<ViewBookingModalProps> = ({
  type,
  isOpen,
  event,
  onRequestClose,
  onApproveClick,
  onNegotiateClick,
  onRejectClick,
}) => {
  const themeContext = useContext(ThemeContext);

  let url: string;

  switch (event.type) {
    case "DAY_PASS":
      url = `/cowork/relationship/daypass/${event.id}`;
      break;
    case "TOUR":
      url = `/cowork/relationship/tours/${event.id}`;
      break;
    case "MEETING_ROOM":
    case "MEETING":
      url = `/cowork/meetrooms/book/${event.id}`;
      break;
  }

  const { data: { result: booking } = {} } = useFetch(url);

  const handleAcceptClick = () => {
    onApproveClick(event.id, event.type);
    onRequestClose();
  };
  const handleNegotiateClick = () => {
    onNegotiateClick(event.id, event.type);
    onRequestClose();
  };
  const handleRejectClick = () => {
    onRejectClick(event.id, event.type);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      className="react-modal-content"
      overlayClassName="react-modal-overlay"
    >
      <CloseModalButton onClick={onRequestClose} />
      <Container>
        <header>
          <h1>
            {BookingTypeEnum[event.type]} ID: #{event?.id}
          </h1>
        </header>

        <Form>
          <>
            <section>
              <Row gap={15}>
                <InputComponent value={event.user_name ?? ""} readOnly />
              </Row>
              <Row gap={15}>
                <InputComponent
                  value={event.user_email ?? ""}
                  title={event.user_email ?? ""}
                  readOnly
                />
                {/* <InputComponent name="phone" value={""} readOnly /> */}
              </Row>
              {/* <div>
                <InputComponent
                  name="company_name"
                  // value={
                  //   event.lead ? event.lead.clientAccount.company_name : ""
                  // }
                  readOnly
                />
              </div> */}
              <div>
                <InputComponent value={event.location_name} readOnly />
              </div>
              {event.type !== "TOUR" && (
                <div>
                  <InputComponent
                    value={
                      event.resource_name
                        ? event.resource_name
                        : event.type === "MEETING_ROOM"
                        ? booking?.meetroom?.name
                        : event.type === "DAY_PASS"
                        ? ServiceTypeEnum[booking.space]
                        : ""
                    }
                    readOnly
                  />
                </div>
              )}
              <DatetimeContainer>
                <span>{formatDateExtendMonth(event.start_date)}</span>
                <div>
                  <TimeContainer>
                    <p>From:</p>
                    <span>{formatTime(event.start_date)}</span>
                  </TimeContainer>
                  <TimeContainer>
                    <p>To:</p>
                    <span>{formatTime(event.end_date)}</span>
                  </TimeContainer>
                </div>
              </DatetimeContainer>
            </section>
            {event.type === "MEETING_ROOM" || event.type === "MEETING" ? (
              <section>
                {booking ? (
                  <>
                    <div>
                      <TextAreaComponent
                        name="addtional_information"
                        placeholder="Additional Information"
                        value={
                          booking.additional_information === "undefined" ||
                          !booking.additional_information
                            ? ""
                            : booking.additional_information
                        }
                        readOnly
                      />
                    </div>

                    <SectionDivider>Boonking Price</SectionDivider>
                    <ul>
                      <li>
                        <p>
                          {Math.ceil(booking.quantity_minutes / 60)} Hours x{" "}
                          {Money({ amount: booking.price_per_hour }).toFormat(
                            "$0,0.00"
                          )}
                        </p>
                        <span>
                          <strong>
                            {Money({
                              amount:
                                Math.ceil(booking.quantity_minutes / 60) *
                                booking.price_per_hour,
                            }).toFormat("$0,0.00")}
                          </strong>
                        </span>
                      </li>
                      {booking.fees?.map((tax, index) => (
                        <li key={`${index}-${tax.name}-${tax.value}`}>
                          <p>{tax.name}</p>
                          <span>
                            <strong>
                              {Money({
                                amount: Math.round(tax.value ?? 0),
                              }).toFormat("$0,0.00")}
                            </strong>
                          </span>
                        </li>
                      ))}
                      <li>
                        <p>Discount</p>
                        <span>
                          <strong>
                            {Money({
                              amount: Math.round(booking.amount_discount),
                            }).toFormat("$0,0.00")}
                          </strong>
                        </span>
                      </li>
                      <li>
                        <p>Final Price</p>
                        <span>
                          <strong>
                            {Money({
                              amount: Math.round(booking.total),
                            }).toFormat("$0,0.00")}
                          </strong>
                        </span>
                      </li>
                    </ul>

                    <div>
                      <InputComponent
                        name="location"
                        value={PaymentMethodsEnum[booking.payment_method]}
                        readOnly
                      />
                    </div>
                  </>
                ) : (
                  <LoaderContainer>
                    <Loader size={30} color={themeContext.colors.blue200} />
                  </LoaderContainer>
                )}
              </section>
            ) : null}
          </>
        </Form>
        <ButtonsContainer>
          {type === "agenda" && (
            <DotsMenuButton
              text="Accept"
              icon="like"
              theme="success"
              onClick={handleAcceptClick}
            />
          )}
          <DotsMenuButton
            text="Negotiate"
            icon="chat"
            theme="warning"
            onClick={handleNegotiateClick}
          />
          <DotsMenuButton
            text={type === "agenda" ? "Reject" : "Cancel"}
            icon="like"
            flip={true}
            theme="danger"
            onClick={handleRejectClick}
          />
        </ButtonsContainer>
      </Container>
    </Modal>
  );
};
