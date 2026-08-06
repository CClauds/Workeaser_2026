import { ActivityElement } from "@components/ActivityElement";
import { InputComponent } from "@components/FormElements/Input";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { ClientLayout } from "@components/Layouts/ClientLayout";
import { MemberLayout } from "@components/Layouts/MembershipLayout";
import { SingleInputModal } from "@components/Modals/SingleInputModal";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { Thumbnail } from "@components/Thumbnail";
import { AuthContext } from "@contexts/AuthContext";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import {
  ActivitySection,
  BorderedRow,
  BorderedSection,
  Container,
  Content,
  InfosBlock,
  InfoSection,
  PhotoSection,
  TopRow,
} from "@styles/pages/relationship/client-management/mailbox/single";
import { Row } from "@styles/reusable";
import { dateMask } from "@utils/masks";
import { formatDateNew } from "@utils/numberFormat";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext, useState } from "react";
import { toast } from "react-toastify";
import { ThemeContext } from "styled-components";
import { Fallback } from "types";
import { MailboxResponse } from "types/cowork/relationship";
import { ClientMailboxStatusEnum, MailboxStatusEnum } from "types/enums";
import { OptionType } from "types/form";
import { UserClient } from "types/user";
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
  const { id, deliveryId } = context.params;

  const { data: mailbox } = await apiClient.get<MailboxResponse>(
    `/client/mailbox/${deliveryId}`
  );
  return {
    props: {
      id,
      deliveryId,
      fallback: {
        [`/client/mailbox/${deliveryId}`]: mailbox,
      },
    },
  };
};

interface MailboxDetailsProps {
  id: number;
  deliveryId: number;
  fallback: Fallback;
}
const MailboxDetails = ({ id, deliveryId, fallback }: MailboxDetailsProps) => {
  const { user: loggedUser } = useContext(AuthContext) as { user: UserClient };
  const themeContext = useContext(ThemeContext);
  const user = {
    name: `${loggedUser?.first_name} ${loggedUser?.last_name}`,
    email: loggedUser?.email,
    phone: loggedUser?.personal_phone,
    company: loggedUser?.clientAccount.company_name,
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: { result: mailbox } = {}, mutate } = useFetch<MailboxResponse>(
    `/client/mailbox/${deliveryId}`,
    {
      fallback,
    }
  );

  const handleAction = async (option: OptionType) => {
    if (option.value === "FORWARD") {
      setIsModalOpen(true);
      return;
    }
    try {
      await api.put(`/client/mailbox/${deliveryId}`, {
        requested_action: option.value,
      });
      mutate();
      toast.success(
        `Status updated to ${ClientMailboxStatusEnum[option.value]}`
      );
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const handleForwardAction = async (observation: string) => {
    await api.put(`/client/mailbox/${deliveryId}`, {
      requested_action: "FORWARD",
      forward_observation: observation,
    });
    mutate();
    toast.success(`Status updated`);
  };

  return (
    <>
      <Head>
        <title>Mailbox | Workeaser</title>
      </Head>

      <div className={styles.container}>
        <PageHeader>
          <div>
            <h1>
              <Link href={`/client/membership/${id}/mailbox-manager`}>
                Mailbox Manager
              </Link>
            </h1>
            <h2>Delivery #{id}</h2>
          </div>

          <div>
            <SelectComponent
              placeHolder="Command Action"
              width={200}
              backgroundColor={themeContext.colors.darkGray}
              onChange={handleAction}
              options={Object.keys(ClientMailboxStatusEnum).map((item) => ({
                value: item,
                label: ClientMailboxStatusEnum[item],
              }))}
            />
          </div>
        </PageHeader>

        <Container>
          <TopRow>
            <BorderedRow>
              <p>Received On:</p>
              <time>{dateMask(mailbox.delivery_date)}</time>
            </BorderedRow>
            <StatusContainer>
              {MailboxStatusEnum[mailbox.status]}
            </StatusContainer>
          </TopRow>

          <Content>
            <Row gap={15} align="stretch" wrap="wrap">
              <InfosBlock>
                <Row gap={15} align="stretch" wrap="wrap">
                  <InfoSection>
                    <div>
                      <InputComponent
                        placeholder="Customer Name"
                        value={user.name ?? ""}
                        readOnly
                      />
                    </div>
                    <Row gap={10}>
                      <InputComponent
                        placeholder="Email"
                        value={user.email ?? ""}
                        title={user.email ?? ""}
                        readOnly
                      />
                      <InputComponent
                        placeholder="Phone"
                        value={user.phone ?? ""}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        placeholder="Customer Address"
                        value={user.company ?? ""}
                        title={user.company ?? ""}
                        readOnly
                      />
                    </div>
                  </InfoSection>

                  <InfoSection>
                    <div>
                      <InputComponent
                        placeholder="Location Name"
                        value={mailbox?.location?.name ?? ""}
                        readOnly
                      />
                    </div>
                    <Row gap={10}>
                      <InputComponent
                        value={mailbox?.location?.email ?? ""}
                        readOnly
                      />
                      <InputComponent
                        value={mailbox?.location?.phone ?? ""}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        value={
                          mailbox?.location?.address?.fulltext ?? "Not informed"
                        }
                        title={mailbox?.location?.address?.fulltext ?? ""}
                        readOnly
                      />
                    </div>
                  </InfoSection>
                </Row>

                <Row gap={15} align="stretch" wrap="wrap">
                  <BorderedSection>
                    <header>
                      <h3>Delivery Notes:</h3>
                    </header>
                    <div>
                      <p>{mailbox.additional_information}</p>
                    </div>
                  </BorderedSection>

                  <PhotoSection>
                    <header>
                      <h3>Delivery Photos</h3>
                    </header>
                    <div>
                      {mailbox.photos.map((photo, index) => (
                        <Thumbnail
                          key={`${index}-${photo.id}`}
                          url={photo.file}
                          size={110}
                          alt=""
                        />
                      ))}
                    </div>
                  </PhotoSection>
                </Row>
              </InfosBlock>

              <ActivitySection>
                <header>
                  <h3>Delivery Activity Track</h3>
                  <time>
                    {!!mailbox.historic.length
                      ? formatDateNew(
                          mailbox.historic[mailbox.historic.length - 1]
                            .created_at
                        )
                      : formatDateNew(mailbox.created_at)}
                  </time>
                </header>

                <div>
                  <ActivityElement
                    title="Receivable Arrived:"
                    text="Received on"
                    date={dateMask(mailbox.delivery_date)}
                    isLastChild={!mailbox.historic?.length}
                  />
                  {mailbox.historic.map((history, index) => (
                    <ActivityElement
                      key={history.id}
                      title={MailboxStatusEnum[history.status]}
                      text={history.message}
                      date={formatDateNew(history.created_at)}
                      isLastChild={index === mailbox.historic.length - 1}
                    />
                  ))}
                </div>
              </ActivitySection>
            </Row>
          </Content>
        </Container>
      </div>

      <SingleInputModal
        onSubmitObservation={handleForwardAction}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

MailboxDetails.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <ClientLayout componentProps={componentProps}>
    <MemberLayout>{page}</MemberLayout>
  </ClientLayout>
);
export default MailboxDetails;
