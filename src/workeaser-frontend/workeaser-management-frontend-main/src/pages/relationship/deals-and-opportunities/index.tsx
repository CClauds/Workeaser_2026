import { BookingsOptions } from "@components/DotsMenu/BookingsOptions";
import { Menu } from "@components/DotsMenu/Menu";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { formatServicesArray } from "@utils/helpers";
import { DATE_MASK, formatDateNew } from "@utils/numberFormat";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { DealsColorEnum, DealsEnum } from "types/enums";
import { Service } from "types/infos";
import { format as formatDate } from "date-fns";
import { AxiosResponse } from "axios";
import {
  Address,
  DealAndOpportunity,
  Photo,
  SingleRequest,
} from "types/dealopportunity";
import { AttachContract } from "@components/Modals/AttachContract";

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

  const dealsPromise = apiClient.get("/cowork/relationship/dealsopportunities");
  const servicesPromise = apiClient.get("/infos/services");

  const [{ data: deals }, { data: services }] = await Promise.all([
    dealsPromise,
    servicesPromise,
  ]);

  return {
    props: {
      services: services.result,
      fallback: {
        "/cowork/relationship/dealsopportunities": deals,
      },
    },
  };
};

interface DealsAndOpportunitiesProps {
  services: Service[];
  fallback: Fallback;
}

interface OpportunityAttach {
  client_uuid: string;
  service_name: string;
  client: {
    first_name: string;
    last_name: string;
    personal_phone: string;
    companyName: string;
    email: string;
  };
  location_id: number;
  location: {
    id: number;
    name: string;
    photos: Photo[];
    address: Address;
  };
  initial_payment: string;
  service_type: string;
  resource_id: number;
  term_size: "MONTH_1" | "MONTH_3" | "MONTH_6" | "YEAR_1" | "YEAR_2" | "YEAR_3";
  auto_renew: boolean;
  contract_recurring: "MONTHLY" | "TOTAL";
}

const DealsAndOpportunities = ({
  services,
  fallback,
}: DealsAndOpportunitiesProps) => {
  const router = useRouter();
  const [isAttachOpen, setIsAttachOpen] = useState<boolean>(false);
  const [opportunityAttach, setOpportunityAttach] =
    useState<OpportunityAttach>();
  const { data: { result: deals } = {}, mutate } = useFetch(
    "/cowork/relationship/dealsopportunities",
    {
      fallback,
    }
  );

  const onRequestClose = () => setIsAttachOpen(false);

  const columns = useMemo(() => {
    const handleView = (id: number) => () => {
      router.push(`/relationship/deals-and-opportunities/${id}`);
    };

    const handleApprove = async (id: number) => {
      try {
        await api.post(`/cowork/relationship/dealsopportunities/${id}/approve`);
        toast.success("Deal approved");
        mutate();
      } catch (error) {
        toast.error(error.response.data.error.message);
        console.log(error.response.data);
      }
    };
    const handleReject = async (id: number) => {
      try {
        await api.post(`/cowork/relationship/dealsopportunities/${id}/reject`);
        toast.error("Deal rejected");
        mutate();
      } catch (error) {
        toast.error(error.response.data.error.message);
        console.log(error.response.data);
      }
    };
    const handleNegotiate = (id: number) => {
      router.push("/relationship/omnichat");
    };

    const handleAttach = async (id: number) => {
      try {
        const {
          data: { result: opportunity },
        } = await api.get<SingleRequest<DealAndOpportunity>>(
          `/cowork/relationship/dealsopportunities/${id}`
        );
        if (!opportunity?.clientAccount?.user) {
          toast.warn("We can't prefilling the client details.");
          return;
        }
        setOpportunityAttach({
          client_uuid: opportunity?.clientAccount?.user?.uuid,
          initial_payment: opportunity.initial_payment,
          client: {
            first_name: opportunity?.clientAccount?.user?.first_name,
            last_name: opportunity?.clientAccount?.user?.last_name,
            personal_phone: opportunity?.clientAccount?.user?.personal_phone,
            email: opportunity?.clientAccount?.user?.email,
            companyName: opportunity?.clientAccount?.company_name,
          },
          location_id: opportunity.location_id,
          location: {
            id: opportunity.location.id,
            name: opportunity.location.name,
            photos: opportunity.location.photos,
            address: opportunity.location.address,
          },
          service_name: opportunity.service_name,
          service_type: opportunity.service_type,
          resource_id: opportunity.resource_id,
          term_size: opportunity.term_size,
          auto_renew: opportunity.auto_renew === "Active" ? true : false,
          contract_recurring: opportunity.contract_recurring.toUpperCase() as
            | "MONTHLY"
            | "TOTAL",
        });
        setIsAttachOpen(true);
      } catch (error) {
        toast.error(
          "Something went wrong when we trying to get deals and opportunity"
        );
      }
    };

    return [
      {
        Header: "ID",
        accessor: "id",
      },
      // {
      //   Header: "",
      //   accessor: "thumbnail",
      //   className: "align__center",
      //   Cell: ({ value }) => <Thumbnail url={value} alt="" size={50} />,
      // },
      {
        Header: "Service Name & Location",
        accessor: "location",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Selected Service",
        accessor: "services",
        Cell: ({ value }) => (
          <ServicesRow services={services} selectedServices={value} />
        ),
      },
      {
        Header: "Requestor Name & Date",
        accessor: "requestorName",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell
              title={parsedValue[0]}
              subtitle={`Request Date: ${formatDate(
                new Date(parsedValue[1]),
                DATE_MASK
              )}`}
            />
          );
        },
      },
      {
        Header: "Inquire Type",
        accessor: "inquireType",
        className: "align__center",
        Cell: ({ value }) => (
          <StatusContainer bgColor={DealsColorEnum[value]}>
            {DealsEnum[value]}
          </StatusContainer>
        ),
      },
      {
        Header: "Potential Earnings",
        accessor: "potentialEarnings",
        className: "align__center",
        Cell: ({ value }: { value: number }) => (
          <StatusContainer bgColor="yellow">
            {Money({ amount: value, precision: 2 }).toFormat("$0,0.00")}
          </StatusContainer>
        ),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Menu
            id={value}
            optionsType="lead"
            onGreenButtonClick={handleApprove}
            onYellowButtonClick={handleNegotiate}
            onRedButtonClick={handleReject}
            extraOptions={
              <BookingsOptions
                id={value}
                onAttachClick={handleAttach}
                onViewClick={handleView}
              />
            }
          />
        ),
      },
    ];
  }, [router]);

  const tableData = useMemo(
    () =>
      deals?.map((deal) => ({
        id: deal.id,
        location: `${deal.service_name}&${deal.location_name}`,
        services: formatServicesArray([deal.service_type], services),
        requestorName: `${deal.user_name}&${deal.request_date}`,
        inquireType: deal.inquire_type,
        potentialEarnings: deal.potential_earning,
        menu: deal.id,
      })),
    [deals]
  );

  return (
    <>
      <Head>
        <title>Deals &amp; Opportunities | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>
            <Link href="/relationship/dashboard">Relationship</Link>
          </h1>
          <h2>Deals &amp; Opportunities</h2>
        </div>
      </PageHeader>

      <div>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[4, 27, 16, 25, 10, 14, 2]}
        />
      </div>

      <AttachContract
        initialClient={
          opportunityAttach && {
            ...opportunityAttach.client,
            uuid: opportunityAttach.client_uuid,
            clientAccount: {
              company_name: opportunityAttach.client.companyName,
            },
          }
        }
        initialService={
          opportunityAttach && {
            id: opportunityAttach.resource_id,
            type: opportunityAttach.service_type,
            name: opportunityAttach.service_name,
            location: opportunityAttach?.location?.name,
            location_id: opportunityAttach.location_id,
            payment_recurring_style: opportunityAttach.contract_recurring,
            auto_renewal: !!opportunityAttach.auto_renew,
            term_size: opportunityAttach.term_size,
          }
        }
        isOpen={isAttachOpen}
        onRequestClose={onRequestClose}
      />
    </>
  );
};

DealsAndOpportunities.getLayout = (
  page: ReactElement,
  componentsProps: PagesProps
) => <CoworkingLayout componentProps={componentsProps}>{page}</CoworkingLayout>;
export default DealsAndOpportunities;
