import { ConfirmationModal } from "@components/Modals/ConfirmationModal";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import React, { useState } from "react";
import { AgendaButtonContainer, Container } from "./styles";

interface AgendaResponse {
  result: { id: number; service: "GOOGLE" | "EXCHANGE" }[];
}

export const Agendas: React.FC = () => {
  const [currentIntegrationType, setCurrentIntegrationType] = useState<
    "google" | "exchange"
  >();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: { result: agendas } = {}, mutate } = useFetch<AgendaResponse>(
    "/cowork/settings/calendar"
  );

  const getCalendarLink = async (type: "google" | "exchange") => {
    setCurrentIntegrationType(type);

    if (
      type === "google" &&
      !!agendas.find((agenda) => agenda.service === "GOOGLE")
    ) {
      setIsModalOpen(true);
      return;
    }
    if (
      type === "exchange" &&
      !!agendas.find((agenda) => agenda.service === "EXCHANGE")
    ) {
      setIsModalOpen(true);
      return;
    }
    const { data: response } = await api.get(
      `/cowork/settings/calendar/${type}/redirect`
    );
    window.open(response.result.url, "_blank");
  };

  const handleDeleteIntegration = async () => {
    const agenda = agendas.find(
      (agenda) => agenda.service.toLowerCase() === currentIntegrationType
    );
    setIsModalOpen(false);

    await api.delete(`/cowork/settings/calendar/${agenda.id}`);
    mutate();
  };

  return (
    <Container>
      <AgendaButtonContainer
        isActive={!!agendas?.find((agenda) => agenda.service === "GOOGLE")}
        onClick={() => getCalendarLink("google")}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <defs>
            <clipPath>
              <rect
                width="40"
                height="40"
                transform="translate(536 272)"
                fill="#fff"
                stroke="#ecf1f6"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(-536 -272)" clipPath="url(#clipPath)">
            <g transform="translate(536 272)">
              <rect
                width="24.444"
                height="24.444"
                transform="translate(7.778 7.778)"
                fill="#fff"
              />
              <path
                d="M42.8,33.587l1.12,1.6,1.76-1.28v9.28H47.6V31.027H46Z"
                transform="translate(-20.933 -17.009)"
                fill="#1e88e5"
              />
              <path
                d="M34.937,36.566a3.386,3.386,0,0,0,1.126-2.5,3.67,3.67,0,0,0-3.8-3.52,3.728,3.728,0,0,0-3.7,2.726l1.841.468a1.86,1.86,0,0,1,1.859-1.273,1.624,1.624,0,1,1,0,3.2H31.158v1.92h1.108a2.075,2.075,0,0,1,2.214,1.822,2.006,2.006,0,0,1-2.146,1.822,2.07,2.07,0,0,1-2.127-1.576l-1.874.307a3.981,3.981,0,0,0,4,3.189,3.907,3.907,0,0,0,4.044-3.742A3.609,3.609,0,0,0,34.937,36.566Z"
                transform="translate(-16.111 -16.849)"
                fill="#1e88e5"
              />
              <path
                d="M45,65.556H22.778l-1.111-4.444,1.111-4.444H45l1.111,4.444Z"
                transform="translate(-13.889 -25.556)"
                fill="#fbc02d"
              />
              <path
                d="M61.111,46.111,65.556,45V22.778l-4.444-1.111-4.444,1.111V45Z"
                transform="translate(-25.556 -13.889)"
                fill="#4caf50"
              />
              <path
                d="M41.111,18.889l1.111-4.444L41.111,10H13.333A3.333,3.333,0,0,0,10,13.333V41.111l4.444,1.111,4.444-1.111V18.889Z"
                transform="translate(-10 -10)"
                fill="#1e88e5"
              />
              <path
                d="M56.667,56.667v8.889l8.889-8.889Z"
                transform="translate(-25.556 -25.556)"
                fill="#e53935"
              />
              <path
                d="M62.222,10H56.667v8.889h8.889V13.333A3.333,3.333,0,0,0,62.222,10Z"
                transform="translate(-25.556 -10)"
                fill="#1565c0"
              />
              <path
                d="M13.333,65.556h5.556V56.667H10v5.556A3.333,3.333,0,0,0,13.333,65.556Z"
                transform="translate(-10 -25.556)"
                fill="#1565c0"
              />
            </g>
          </g>
        </svg>

        <span>Google Calendar</span>
      </AgendaButtonContainer>
      <AgendaButtonContainer
        isActive={!!agendas?.find((agenda) => agenda.service === "EXCHANGE")}
        onClick={() => getCalendarLink("exchange")}
      >
        <svg width="40" height="40" viewBox="0 0 40 40">
          <defs>
            <clipPath>
              <rect
                width="40"
                height="40"
                transform="translate(686 272)"
                fill="#fff"
                stroke="#ecf1f6"
                strokeWidth="1"
              />
            </clipPath>
          </defs>
          <g transform="translate(-686 -272)" clipPath="url(#clipPath)">
            <g transform="translate(686 272)">
              <path
                d="M58.333,21.667H41.667V46.111H58.333a2.223,2.223,0,0,0,2.222-2.222v-20A2.223,2.223,0,0,0,58.333,21.667Z"
                transform="translate(-20.556 -13.889)"
                fill="#64b5f6"
              />
              <path
                d="M59.746,29.16v2.713a.732.732,0,0,1-.157.553l-2.022,2.021a.29.29,0,0,1-.467,0l-.777-.622a.29.29,0,0,1,0-.467l.932-.933h0V29.159h-2.8c-2.489,1.867-4.511,5.289-5.133,4.667-.777-.623,4.046-7,4.666-7.156h5.289a.414.414,0,0,1,.468.468V29.16Z"
                transform="translate(-23.079 -15.557)"
                fill="#fff"
              />
              <path
                d="M58.563,48.079H55.85a.732.732,0,0,1-.553-.157L53.275,45.9a.29.29,0,0,1,0-.467l.622-.778a.29.29,0,0,1,.467,0l.933.933h3.267v-2.8C56.7,40.3,53.275,38.277,53.9,37.656c.623-.778,7,4.046,7.156,4.666V47.61a.414.414,0,0,1-.468.469Z"
                transform="translate(-24.386 -19.19)"
                fill="#fff"
              />
              <path
                d="M39.238,46.9V44.183a.732.732,0,0,1,.157-.553l2.022-2.022a.29.29,0,0,1,.467,0l.777.622a.29.29,0,0,1,0,.467l-.932.933h0V46.9h2.8c2.489-1.867,4.511-5.289,5.133-4.667.777.623-4.046,7-4.666,7.156H39.707a.414.414,0,0,1-.468-.468V46.9Z"
                transform="translate(-19.746 -20.497)"
                fill="#fff"
              />
              <path
                d="M41.727,26.672H44.44a.732.732,0,0,1,.553.157l2.021,2.022a.29.29,0,0,1,0,.467l-.622.778a.29.29,0,0,1-.467,0l-.933-.933H41.726v2.8c1.867,2.489,5.289,4.512,4.667,5.133-.623.778-7-4.046-7.156-4.666V27.141a.414.414,0,0,1,.468-.468h2.022Z"
                transform="translate(-19.746 -15.557)"
                fill="#fff"
              />
              <path
                d="M33.333,50,10,45.556V14.444L33.333,10Z"
                transform="translate(-10 -10)"
                fill="#1e88e5"
              />
              <path
                d="M28.889,45.333,20,44.554v-17l8.578-.929v3.426l-5.3.314v3.9l4.836-.154v3.424H23.277v4.061l5.612.311Z"
                transform="translate(-13.333 -15.541)"
                fill="#fff"
              />
            </g>
          </g>
        </svg>

        <span>Microsoft Exchange</span>
      </AgendaButtonContainer>

      <ConfirmationModal
        title="Delete integration"
        text={`Are you sure you want to delete ${currentIntegrationType} integration?`}
        onConfirm={handleDeleteIntegration}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </Container>
  );
};
