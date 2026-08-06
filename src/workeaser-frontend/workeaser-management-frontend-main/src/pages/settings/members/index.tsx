import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { InputComponent } from "@components/FormElements/Input";
import { Icomoon } from "@components/Icomoon";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { DoublelineCell } from "@components/Table/Cell/DoublelineCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { Thumbnail } from "@components/Thumbnail";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { Button } from "components/Button";
import { useFetch } from "hooks/useFetch";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";
import { useTheme } from "styled-components";
import { Fallback } from "types";
import { InviteData, MemberData } from "types/cowork/employees";
import styles from "../styles.module.scss";
import { toast } from "react-toastify";

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
  try {
    const { data: members } = await apiClient.get<MemberData>(
      "/cowork/employees"
    );
    const { data: invites } = await apiClient.get<InviteData>(
      "/cowork/employees/invites"
    );
    return {
      props: {
        fallbackMembers: {
          "/cowork/employees": members,
        },
        fallbackInvites: {
          "/cowork/employees/invites": invites,
        },
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.response?.data,
        fallbackMembers: {},
        fallbackInvites: {},
      },
    };
  }
};

interface MembersProps {
  fallbackMembers: Fallback;
  fallbackInvites: Fallback;
}

const Members = ({ fallbackMembers, fallbackInvites }: MembersProps) => {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");

  const { data: members, mutate: membersMutate } = useFetch<MemberData>(
    "/cowork/employees",
    { fallback: fallbackMembers }
  );
  const { data: invites, mutate: invitesMutate } = useFetch<InviteData>(
    "/cowork/employees/invites",
    { fallback: fallbackInvites }
  );

  const handleDeleteMember = async (
    id: string,
    type: string,
    handleClose: () => void
  ) => {
    handleClose();
    if (type === "invite") {
      await api.delete(`/cowork/employees/invites/${id}`);
      toast.success("Invitation canceled.");
      invitesMutate();
    } else {
      await api.delete(`/cowork/employees/${id}`);
      toast.success("Member deleted.");
      membersMutate();
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "",
        accessor: "avatar",
        disableSortBy: true,
        Cell: ({ value }) => (
          <Thumbnail url={value} size={40} alt="profile photo" />
        ),
      },
      {
        Header: "Name & Email",
        accessor: "name",
        Cell: ({ value }) => {
          const parsedValue = value.split("&");
          return (
            <DoublelineCell title={parsedValue[0]} subtitle={parsedValue[1]} />
          );
        },
      },
      {
        Header: "Status",
        accessor: "status",
        className: "align__center",
        Cell: ({ value }) => <StatusContainer>{value}</StatusContainer>,
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }: { value: { id: string; type: string } }) => (
          <MenuWrapper>
            {(handleClose) => (
              <OptionsButton
                onClick={() =>
                  handleDeleteMember(value.id, value.type, handleClose)
                }
                icon={<Icomoon iconName="trash" color={theme.colors.blue800} />}
              >
                {value.type === "member"
                  ? "DELETE MEMBER"
                  : "CANCEL INVITATION"}
              </OptionsButton>
            )}
          </MenuWrapper>
        ),
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    let data = [];
    data = [
      ...(members?.result
        ? members?.result.map((member) => ({
            avatar: member.photo?.file ?? "",
            name: `${member.first_name} ${member.last_name}&${member.email}`,
            status: "Active",
            created_at: member.created_at,
            menu: { id: member.uuid, type: "member" },
          }))
        : []),
      ...(invites?.result
        ? invites?.result.map((invite) => ({
            avatar: "",
            name: `${invite?.invitee_first_name}&${invite.email}`,
            status: "Inactive",
            created_at: invite.created_at,
            menu: { id: invite.uuid, type: "invite" },
          }))
        : []),
    ];

    return data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [members, invites]);

  return (
    <>
      <Head>
        <title>Team Members | Workeaser</title>
      </Head>

      <div className={styles.walletContainer}>
        <section className={`${styles.buttonContainer} ${styles.spaceBetween}`}>
          <InputComponent
            type="search"
            placeholder="Search Member"
            // icon="search"
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <Link href="/settings/members/add">
            <Button text="ADD TEAM MEMBER" color="primary" />
          </Link>
        </section>
        <section>
          <StyledTable
            columns={columns}
            data={tableData}
            columnsWidth={[13, 60, 25, 2]}
            filterValue={searchTerm}
          />
        </section>
      </div>
    </>
  );
};

Members.authRoles = ["COWORKING"];
Members.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default Members;
