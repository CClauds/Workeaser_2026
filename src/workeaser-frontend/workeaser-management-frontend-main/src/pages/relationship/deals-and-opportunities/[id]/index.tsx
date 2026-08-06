import { Input } from "@components/Form/Input";
import { Radio } from "@components/Form/Radio";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { getAPIClient } from "@services/apiClient";
import { formatServicesArray } from "@utils/helpers";
import Money from "dinero.js";

import { Select } from "@components/Form/Select";
import { FrindlyTermSizeEnum } from "@components/Modals/AttachContract";
import { useFetch } from "@hooks/useFetch";
import {
  Column,
  Container,
  Form,
} from "@styles/pages/relationship/deals-and-opportunities/single";
import { Row } from "@styles/reusable";
import { FormHandles } from "@unform/core";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useRef } from "react";
import { Fallback } from "types";
import { DealAndOpportunity, SingleRequest } from "types/dealopportunity";
import { Service } from "types/infos";
import { SpaceResponse } from "types/spaces";

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

  if (id) {
    try {
      const dealPromise = apiClient.get<SpaceResponse>(
        `/cowork/relationship/dealsopportunities/${id}`
      );

      const servicesPromise = apiClient.get("/infos/services");

      const [{ data: deals }, { data: services }] = await Promise.all([
        dealPromise,
        servicesPromise,
      ]);

      return {
        props: {
          services: services.result,

          fallback: {
            [`/cowork/relationship/dealsopportunities/${id}`]: deals.result,
          },
        },
      };
    } catch (error) {
      return {
        props: {
          error: error?.response?.data,
          services: [],
          fallback: {},
        },
      };
    }
  }

  return {
    props: {
      fallback: {},
    },
  };
};

interface SingleDealsAndOpportunitiesProps {
  fallback: Fallback;
  services: Service[];
}

const SingleDeal = ({
  fallback,
  services,
}: SingleDealsAndOpportunitiesProps) => {
  const formRef = useRef<FormHandles>(null);
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: deal } = {} } = useFetch<
    SingleRequest<DealAndOpportunity>
  >(`/cowork/relationship/dealsopportunities/${id}`, {
    fallback,
  });

  useEffect(() => {
    if (deal) {
      formRef.current?.setData({
        ...deal,
        ...deal.clientAccount,
        ...deal.clientAccount.user,
        client_uuid: deal.clientAccount.uuid,
        term_size: FrindlyTermSizeEnum[deal.term_size],
        initial_payment: Money({
          amount: parseFloat(deal?.initial_payment || "0"),
          precision: 2,
        }).toFormat("0,0.00"),
        phone: deal?.clientAccount?.company_phone || "(00) 0000-0000",
      });
    }
  }, [deal]);

  return (
    <>
      <Head>
        <title></title>
      </Head>
      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>
            <Link href="/relationship/deals-and-opportunities">
              Deals &amp; Opportunities
            </Link>
          </h2>
          <h2>Inquire ID #{deal?.id || "00"}</h2>
        </div>
      </PageHeader>

      <Container>
        <Form ref={formRef} onSubmit={() => {}}>
          <Column>
            <Row gap={15}>
              <Input name="first_name" disabled />
              <Input name="last_name" disabled />
            </Row>
            <Row gap={15}>
              <Input name="email" disabled />
              <Input name="phone" disabled />
            </Row>
            <Input name="company_name" disabled />

            <Select
              locationId={deal?.location_id}
              instanceId="location_id"
              name="location_id"
              placeholder="Space Name"
              icon="location"
              formatType="locations"
              isDisabled={true}
              value={{
                value: deal?.location?.id,
                label: deal?.location?.name,
              }}
              isLoading={!deal}
            />
            {/* <Input name="company_address" disabled /> */}

            {/* <Dropzone name="documents" label="Drop the Client Documents" /> */}
          </Column>
          <Column>
            <Input name="service_name" disabled />

            <Row>
              <p>Selected the Service Type:</p>
              {deal && (
                <ServicesRow
                  services={services}
                  selectedServices={formatServicesArray(
                    [deal?.service_type],
                    services
                  )}
                />
              )}
            </Row>

            <Row gap={5}>
              <p>Contract term size:</p>
              <Input name="term_size" width={100} disabled />
            </Row>
            <Row>
              <p>This contract will auto-renewal?</p>
              <Radio
                name="auto_renew"
                disabled
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "False" },
                ]}
              />
            </Row>
            <Row>
              <p>Payment recurring style:</p>
              <Radio
                disabled
                name="contract_recurring"
                options={[
                  { value: "MONTHLY", label: "Monthly" },
                  { value: "TOTAL", label: "Total" },
                ]}
              />
            </Row>
            <Row gap={5}>
              <p>Initial payment:</p>
              <span>$</span>
              <Input name="initial_payment" width={80} disabled />
            </Row>

            {/* <Row>
              <p>Recurring Invoice Date:</p>
            </Row>
            <Row>
              <p>
                How many Days of <strong>Coworking usage per Month?</strong>
              </p>
              <Input name="usage" type="number" width={80} disabled />
            </Row>
            <Row>
              <p>
                How many Hours of <strong>Meeting Room usage per Month?</strong>
              </p>
              <Input name="usage_month" type="number" width={80} disabled />
            </Row> */}
          </Column>
        </Form>
      </Container>
    </>
  );
};

export default SingleDeal;
SingleDeal.getLayout = (page: ReactElement, componentsProps: PagesProps) => (
  <CoworkingLayout componentProps={componentsProps}>{page}</CoworkingLayout>
);

const SERVICE_TYPES = [
  {
    name: "Private Room",
    slug: "PRIVATE_ROOM",
    abbr: "PR",
  },
  {
    name: "Open Desk",
    slug: "OPEN_DESK",
    abbr: "OD",
  },
  {
    name: "Virtual Office",
    slug: "VIRTUAL_OFFICE",
    abbr: "VO",
  },
];
