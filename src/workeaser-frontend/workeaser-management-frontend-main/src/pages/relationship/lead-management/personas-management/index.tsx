import { Button } from "@components/Button";
import { Menu } from "@components/DotsMenu/Menu";
import { ServicesOptions } from "@components/DotsMenu/ServicesOptions";
import { FilterButton } from "@components/Filters/FilterButton";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { ServicesRow } from "@components/Table/Row/ServicesRow";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { PersonasFiltersComponent } from "@features/Filters/PersonasFilters";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { formatDateNew } from "@utils/numberFormat";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Fallback } from "types";
import { PersonasResponse } from "types/cowork/relationship";
import { Service } from "types/infos";
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

  const personasPromise = apiClient.get<PersonasResponse>(
    "/cowork/relationship/personasmanagement"
  );

  const servicesPromise = apiClient.get<{ result: Service[] }>(
    "/infos/services"
  );

  const [{ data: personas }, { data: services }] = await Promise.all([
    personasPromise,
    servicesPromise,
  ]);

  return {
    props: {
      services: services.result,
      fallback: {
        "/cowork/relationship/personasmanagement": personas,
      },
    },
  };
};

export interface PersonaFilters {
  searchTerm: string;
  contactDateFrom: string;
  contactDateTo: string;
  OPEN_DESK: 0 | 1;
  VIRTUAL_OFFICE: 0 | 1;
  PRIVATE_ROOM: 0 | 1;
  MEETING_ROOM: 0 | 1;
  pipelineOpportunity: 0 | 1;
  pipelineContacted: 0 | 1;
  pipelineRequested: 0 | 1;
  pipelineQuoted: 0 | 1;
  pipelineConverted: 0 | 1;
}

interface PersonasManagementProps {
  services: Service[];
  fallback: Fallback;
  fallbackNextPage: Fallback;
}
const PersonasManagement = ({
  services,
  fallback,
}: PersonasManagementProps) => {
  const [filters, setFilters] = useState<PersonaFilters>({
    searchTerm: "",
    contactDateFrom: "",
    contactDateTo: "",
    OPEN_DESK: null,
    VIRTUAL_OFFICE: null,
    PRIVATE_ROOM: null,
    MEETING_ROOM: null,
    pipelineOpportunity: null,
    pipelineContacted: null,
    pipelineRequested: null,
    pipelineQuoted: null,
    pipelineConverted: null,
  });

  const {
    data: { result: personas, pagination } = {},
    isLoading,
    mutate,
  } = useFetch<PersonasResponse>(formatUrl(filters), {
    fallback,
  });

  const columns = useMemo(() => {
    const handleDelete = async (id: number) => {
      try {
        mutate(
          { result: personas?.filter((lead) => lead.id !== id), pagination },
          false
        );
        await api.delete(`/cowork/relationship/personasmanagement/${id}`);
        toast.success("Lead deleted.");
        mutate();
      } catch (error) {
        console.log(error.response.data);
      }
    };

    return [
      {
        Header: "",
        accessor: "thumbnail",
        className: "align__center",
        disableSortBy: true,
        Cell: ({ value }) => <Thumbnail url={value} alt="" size={50} />,
      },
      {
        Header: "Member & Company Name",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell
              title={parsedValue[0]}
              subtitle={parsedValue[1]}
              style={{ paddingLeft: "10px" }}
            />
          );
        },
      },
      {
        Header: "Email & Phone",
        accessor: "emailAndPhone",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Interest",
        accessor: "interest",
        Cell: ({ value }) => (
          <ServicesRow services={services} selectedServices={value} />
        ),
      },
      // {
      //   Header: "Pipeline Status",
      //   accessor: "status",
      //   className: "align__center",
      //   Cell: ({ value }) => (
      //     <StatusContainer bgColor={PipelineStatusColortEnum[value]}>
      //       {PipelineStatusEnum[value]}
      //     </StatusContainer>
      //   ),
      // },
      {
        Header: "Last Contact",
        accessor: "lastContact",
        className: "align__center",
        Cell: ({ value }) => (value ? formatDateNew(value) : "Not contacted"),
      },
      {
        Header: "",
        accessor: "menu",

        Cell: ({ value }) => (
          <Menu
            id={value}
            optionsType="view"
            onRedButtonClick={handleDelete}
            extraOptions={
              <ServicesOptions
                id={value}
                onAttachClick={(id: number) => () => {}}
                onDetachClick={(id: number) => () => {}}
                type="CUSTOMER"
              />
            }
          />
        ),
      },
    ];
  }, []);

  const tableData = useMemo(
    () =>
      personas?.map((persona) => {
        const { clientAccount, opportunities } = persona;
        const selectedServices = opportunities.map(
          (oppportunity) => oppportunity.service
        );

        return {
          id: persona.id,
          thumbnail: clientAccount.user?.photo?.file,
          name: `${clientAccount.user.first_name} ${
            clientAccount.user.last_name
          }&${clientAccount?.company_name ?? ""}`,
          emailAndPhone: `${clientAccount.user.email}&${clientAccount.user.personal_phone}`,
          interest: selectedServices,
          status: "",
          lastContact: persona.last_contact,
          menu: persona.id,
        };
      }),
    // const { clientAccount, opportunities } = persona;
    // const selectedServices = opportunities.map((oppportunity) => ({
    //   id: persona.id,
    //   name: clientAccount.user.first_name,
    //   email: clientAccount.user.email,
    //   phone: clientAccount.user.personal_phone,
    //   interest: [oppportunity.service],
    //   status: oppportunity.status,
    //   lastContact: persona.last_contact,
    //   menu: persona.id,
    // }));
    // return [...result, ...selectedServices];

    [personas]
  );

  return (
    <>
      <Head>
        <title>Lead Management | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>Lead Management</h2>
          <h2>Personas Management</h2>
        </div>

        <div className={styles.headerButtonsContainer}>
          <FilterButton buttonText="Search &amp; Filters" theme="secondary">
            <PersonasFiltersComponent
              filters={filters}
              setFilters={setFilters}
            />
          </FilterButton>

          {/* <Link href="/relationship/lead-management/add">
                <a>
                  <Button text="Add New Lead" />
                </a>
              </Link> */}
        </div>
      </PageHeader>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          loading={isLoading}
          columnsWidth={[7, 20, 48, 11, 11, 3]}
        />
      </div>
    </>
  );
};

PersonasManagement.getLayout = (
  page: ReactElement,
  componentProps: PagesProps
) => {
  return (
    <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
  );
};
export default PersonasManagement;

const formatUrl = (filters: PersonaFilters) => {
  let url = `/cowork/relationship/personasmanagement?general_query=${filters.searchTerm}`;
  if (filters.contactDateFrom) {
    url += `&contact_date_start=${filters.contactDateFrom}`;
  }
  if (filters.contactDateTo) {
    url += `&contact_date_end=${filters.contactDateTo}`;
  }
  if (filters.VIRTUAL_OFFICE) {
    url += `&inters_virtual_office=${filters.VIRTUAL_OFFICE}`;
  }
  if (filters.OPEN_DESK) {
    url += `&inters_shared_desk=${filters.OPEN_DESK}`;
    url += `&inters_exclusive_desk=${filters.OPEN_DESK}`;
  }
  if (filters.PRIVATE_ROOM) {
    url += `&inters_private_office=${filters.PRIVATE_ROOM}`;
  }
  if (filters.MEETING_ROOM) {
    url += `&inters_meeting_room=${filters.MEETING_ROOM}`;
  }
  if (filters.pipelineOpportunity) {
    url += `&pipe_st_opportunity=${filters.pipelineOpportunity}`;
  }
  if (filters.pipelineContacted) {
    url += `&pipe_st_contacted=${filters.pipelineContacted}`;
  }
  if (filters.pipelineRequested) {
    url += `&pipe_st_requested=${filters.pipelineRequested}`;
  }
  if (filters.pipelineQuoted) {
    url += `&pipe_st_quoted=${filters.pipelineQuoted}`;
  }
  if (filters.pipelineConverted) {
    url += `&pipe_st_converted=${filters.pipelineConverted}`;
  }
  return url;
};
