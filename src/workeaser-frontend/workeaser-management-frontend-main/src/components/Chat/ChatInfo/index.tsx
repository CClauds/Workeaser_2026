import { Button } from "@components/Button";
import { Textarea } from "@components/Form/Textarea";
import { Select } from "@components/Form/Select";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { FormHandles, SubmitHandler } from "@unform/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icomoon } from "../../Icomoon";
import { ChatAvatar } from "../ChatAvatar";
import { Form, NavButton, Row, Line, Intersection, InfoCard } from "./styles";
import { api } from "@services/api";
import styles from "./styles.module.scss";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import {
  ClientInfo,
  ClientInfoResponse,
  ClientProduct,
  ClientProductResponse,
  InvoiceData,
  InvoiceDataResponse,
  LastInvoices,
} from "types/cowork/clients";
import { ParseSmall } from "@utils/helpers";
import { Invoice } from "types/cowork/financial/invoices";
import { toast } from "react-toastify";
import {
  ContractStatusEnum,
  InvoiceStatusEnum,
  ServicesAbbrEnum,
  ServicesNameEnum,
} from "types/enums";
import { Skeleton } from "@components/antd-client";
import { formatDate } from "@utils/numberFormat";
import Link from "next/link";

interface Service {
  service_type: string;
  name: string;
}

interface ResponseState<T> {
  isLoading: boolean;
  data: T;
}

interface ChatInfoProps {
  userId: string;
  companyPhoto: string;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({ userId, companyPhoto }) => {
  const [navigation, setNavigation] = useState("contracting");

  const [client, setClient] = useState<ResponseState<Partial<ClientInfo>>>({
    isLoading: true,
    data: {},
  });
  const [services, setServices] = useState<ResponseState<ClientProduct[]>>({
    isLoading: true,
    data: [],
  });
  const [invoices, setInvoices] = useState<ResponseState<InvoiceData[]>>({
    isLoading: true,
    data: [],
  });

  const ARRAY_LIMIT = 3;

  const getClientUserPersonalInfo = useCallback(async () => {
    setClient((state) => ({ ...state, isLoading: true }));
    try {
      const { data } = await api.get<ClientInfoResponse>(
        `/cowork/clients/${userId}`
      );
      setClient({ data: data.result, isLoading: false });
    } catch (error) {
      toast.error("Something went wrong when trying to get the client info");
    }
    setClient((state) => ({ ...state, isLoading: false }));
  }, [userId]);

  const getServices = useCallback(async () => {
    setServices((state) => ({ ...state, isLoading: true }));
    try {
      const { data } = await api.get<ClientProductResponse>(
        `/cowork/clients/${userId}/products`
      );
      setServices({ data: data.result, isLoading: false });
    } catch (error) {
      toast.error("Something went wrong when trying to get the services");
    }
    setServices((state) => ({ ...state, isLoading: false }));
  }, [userId]);

  const getInvoices = useCallback(async () => {
    setInvoices((state) => ({ ...state, isLoading: true }));
    try {
      const { data } = await api.get<InvoiceDataResponse>(
        `/cowork/clients/${userId}/invoices`
      );
      setInvoices({ data: data.result, isLoading: false });
    } catch (error) {
      toast.error("Something went wrong when trying to get the invoice");
    }
    setInvoices((state) => ({ ...state, isLoading: false }));
  }, [userId]);

  useEffect(() => {
    if (userId) {
      getClientUserPersonalInfo();
      getServices();
      getInvoices();
    }
  }, [userId, getClientUserPersonalInfo, getServices, getInvoices]);

  const sortByDate = (
    data: any[],
    attribute: string,
    orderBy: "DESC" | "ASC"
  ) =>
    data.sort((a, b) =>
      orderBy === "DESC"
        ? new Date(b[attribute]).getTime() - new Date(a[attribute]).getTime()
        : new Date(a[attribute]).getTime() - new Date(b[attribute]).getTime()
    );

  return (
    <div className={styles.container}>
      <header>
        {client.isLoading ? (
          <Skeleton.Avatar
            active
            style={{
              marginRight: 10,
              width: 60,
              height: 60,
            }}
          />
        ) : (
          <ChatAvatar
            url={
              client.data?.photo
                ? client.data?.photo
                : companyPhoto
                ? companyPhoto
                : "/images/workeaser-circle.png"
            }
            alt="avatar"
            size={60}
          />
        )}

        <div>
          {client.isLoading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <h2>{client?.data?.first_name || "Not defined"}</h2>
          )}
          {client.isLoading ? (
            <Skeleton.Input size="small" active />
          ) : (
            <h3>{client?.data?.location || "Location not defined"}</h3>
          )}
        </div>
      </header>

      <div className={styles.infos}>
        <h1>Personal Information:</h1>

        <div className={styles.content}>
          <div className={styles.infosRow}>
            <Icomoon iconName="phone2" />
            {client.isLoading ? (
              <Skeleton.Input size="small" active />
            ) : (
              <p>{client?.data?.phone || "Not defined'"}</p>
            )}
          </div>
          <div className={styles.infosRow}>
            <Icomoon iconName="at" />
            {client.isLoading ? (
              <Skeleton.Input size="small" active />
            ) : (
              <p>{client?.data?.email || "Not defined"}</p>
            )}
          </div>
        </div>
      </div>

      <Form onSubmit={null}>
        <header>
          <NavButton isActive={navigation === "contracting"}>
            CONTRATING
          </NavButton>
        </header>

        <div className="content">
          <section>
            <Intersection>
              <p>Active Services:</p>
              <Line />
            </Intersection>

            {services.isLoading || !services.data ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton.Input
                  key={index}
                  size="large"
                  active
                  style={{
                    width: 242,
                  }}
                />
              ))
            ) : services.data && services.data.length > 0 ? (
              sortByDate(services.data, "service_started_date", "DESC")
                .slice(0, ARRAY_LIMIT)
                .map((service, index) => (
                  <InfoCard key={index}>
                    <div>
                      <h3>{ServicesNameEnum[service.type]}</h3>
                      <p>{service.name}</p>
                    </div>
                    <StatusContainer>
                      {ContractStatusEnum[service.status]}
                    </StatusContainer>
                  </InfoCard>
                ))
            ) : (
              <p>Services not found</p>
            )}
            <small>
              {services.isLoading
                ? ""
                : services.data.length > ARRAY_LIMIT &&
                  (services.data.length - ARRAY_LIMIT === 1
                    ? `one more service...`
                    : `more ${
                        services.data.length - ARRAY_LIMIT
                      } service(s)...`)}
            </small>
          </section>

          <section>
            <Intersection>
              <p>Latest Invoices:</p>
              <Line />
            </Intersection>
            {invoices.isLoading || !invoices.data ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton.Input
                  key={index}
                  size="large"
                  active
                  style={{
                    width: 242,
                  }}
                />
              ))
            ) : invoices.data && invoices.data.length > 0 ? (
              sortByDate(invoices.data, "due_date", "ASC")
                .slice(0, 3)
                .map((invoice, index) => (
                  <InfoCard key={index}>
                    <div>
                      <Link
                        target="_blank"
                        href={`/finances/invoices/${invoice.uuid}`}
                      >
                        <h3>{ParseSmall(invoice.uuid)}</h3>
                      </Link>
                      <p>Due date: {formatDate(new Date(invoice.due_date))}</p>
                    </div>

                    <StatusContainer>
                      {InvoiceStatusEnum[invoice.status]}
                    </StatusContainer>
                  </InfoCard>
                ))
            ) : (
              <p>Services not found</p>
            )}
            <small>
              {invoices.isLoading
                ? ""
                : invoices.data.length > ARRAY_LIMIT &&
                  (invoices.data.length - ARRAY_LIMIT === 1
                    ? `one more invoice...`
                    : `more ${invoices.data.length - ARRAY_LIMIT} invoices...`)}
            </small>
          </section>
        </div>
      </Form>
    </div>
  );
};
