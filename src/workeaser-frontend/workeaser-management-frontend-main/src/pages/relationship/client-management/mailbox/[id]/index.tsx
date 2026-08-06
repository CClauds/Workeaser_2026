import { ActivityElement } from "@components/ActivityElement";
import { InputComponent } from "@components/FormElements/Input";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { Thumbnail } from "@components/Thumbnail";
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
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useContext } from "react";
import { toast } from "react-toastify";
import { ThemeContext } from "styled-components";
import { Fallback } from "types";
import { MailboxResponse } from "types/cowork/relationship";
import { MailboxActionsEnum, MailboxStatusEnum } from "types/enums";
import { OptionType } from "types/form";

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

  const { id } = context.params;
  const apiClient = getAPIClient(context);

  const { data: mailbox } = await apiClient.get<MailboxResponse>(
    `/cowork/relationship/mailbox/${id}`
  );
  return {
    props: {
      fallback: {
        [`/cowork/relationship/mailbox/${id}`]: mailbox,
      },
    },
  };
};

interface MailboxDetailsProps {
  fallback: Fallback;
}
const MailboxDetails = ({ fallback }: MailboxDetailsProps) => {
  const themeContext = useContext(ThemeContext);

  const router = useRouter();
  const { id } = router.query;
  const { data: { result: mailbox } = {}, mutate } = useFetch<MailboxResponse>(
    `/cowork/relationship/mailbox/${id}`,
    {
      fallback,
    }
  );

  const handleAction = async (option: OptionType) => {
    try {
      await api.put(`/cowork/relationship/mailbox/${id}`, {
        status: option.value,
      });
      mutate();
      toast.success(`Status updated to ${MailboxStatusEnum[option.value]}`);
    } catch (error) {
      console.log(error.response.data);
    }
  };

  return (
    <>
      <Head>
        <title>Mailbox | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Relationship</h1>
          <h2>
            <Link href="/relationship/client-management">
              Client Management
            </Link>
          </h2>
          <h2>
            <Link href="/relationship/client-management/mailbox">Mailbox</Link>
          </h2>
          <h2>Delivery {id}</h2>
        </div>

        <div>
          <SelectComponent
            placeHolder="Command Action"
            width={200}
            backgroundColor={themeContext.colors.darkGray}
            onChange={handleAction}
            options={Object.keys(MailboxActionsEnum).map((item) => ({
              value: item,
              label: MailboxActionsEnum[item],
            }))}
          />
        </div>
      </PageHeader>

      {!mailbox ? (
        <h1>No Mailbox found</h1>
      ) : (
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
            <Row gap={15} align="stretch">
              <InfosBlock>
                <Row gap={15} align="stretch">
                  <InfoSection>
                    <div>
                      <InputComponent
                        placeholder="Customer Name"
                        value={mailbox?.clientAccount?.company_name ?? ""}
                        readOnly
                      />
                    </div>
                    <Row gap={10}>
                      <InputComponent
                        placeholder="Email"
                        value={
                          mailbox?.clientAccount?.company_email ??
                          "Not informed"
                        }
                        title={mailbox?.clientAccount?.company_email ?? ""}
                        readOnly
                      />
                      <InputComponent
                        placeholder="Phone"
                        value={
                          mailbox?.clientAccount?.company_phone ??
                          "Not informed"
                        }
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        placeholder="Customer Address"
                        value={
                          mailbox?.clientAccount?.companyAddress?.fulltext ??
                          "Not informed"
                        }
                        title={
                          mailbox?.clientAccount?.companyAddress?.fulltext ?? ""
                        }
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
                        value={mailbox?.location?.email ?? "Not informed"}
                        readOnly
                      />
                      <InputComponent
                        value={mailbox?.location?.phone ?? "Not informed"}
                        readOnly
                      />
                    </Row>
                    <div>
                      <InputComponent
                        value={mailbox?.location.address.fulltext ?? ""}
                        title={mailbox?.location.address.fulltext ?? ""}
                        readOnly
                      />
                    </div>
                  </InfoSection>
                </Row>

                <Row gap={15} align="stretch">
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
      )}
    </>
  );
};

export default MailboxDetails;
MailboxDetails.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
