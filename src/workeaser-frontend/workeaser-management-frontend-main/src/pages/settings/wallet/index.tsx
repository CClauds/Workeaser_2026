import { Menu } from "@components/DotsMenu/Menu";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { capitalizeFirstLetter } from "@utils/helpers";
import { Button } from "components/Button";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo } from "react";
import { toast } from "react-toastify";
import { WalletData } from "types/wallet";
import styles from "../styles.module.scss";
import { useRouter } from "next/router";
import { Fallback } from "types";

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
    const { data } = await apiClient.get<{ result: WalletData }>("/wallet");
    return {
      props: {
        fallback: {
          "/wallet": data,
        },
      },
    };
  } catch (error) {
    return {
      props: {
        error: error.response.data,
        fallback: {},
      },
    };
  }
};

enum WalletEnum {
  card = "Card",
  bank_account = "Bank Account",
}

interface WalletProps {
  fallback: Fallback;
}

const Wallet = ({ fallback }: WalletProps) => {
  const router = useRouter();

  const { data: paymentAccount, mutate } = useFetch<{ result: WalletData }>(
    "/wallet",
    {
      fallback,
    }
  );

  const columns = useMemo(() => {
    const handleEdit = (id: number, type: string) => {
      router.push({
        pathname: "/settings/wallet/add",
        query: { id, payment_method: type },
      });
    };
    const handleDelete = async (id: number, type: string) => {
      mutate(
        {
          ...paymentAccount,
          [`${type}s`]: paymentAccount[`${type}s`]?.filter(
            (wallet: { id: number }) => wallet.id !== id
          ),
        },
        false
      );
      try {
        await api.delete(`/wallet/${type}/${id}`);
        toast.success(`${WalletEnum[type]} Deleted`);
      } catch (error) {
        console.log(error.response.data);
        toast.error(`Error trying to delete ${WalletEnum[type]}`);
      }

      mutate();
    };
    return [
      {
        Header: "Payment Type",
        accessor: "paymentType",
      },
      {
        Header: "Ending Number",
        accessor: "endingNumber",
        className: "align__center",
      },
      {
        Header: "Payment Nickname",
        accessor: "paymentNickname",
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }: { value: { id: number; type: string } }) => (
          <Menu
            id={value.id}
            type={value.type}
            onYellowButtonClick={handleEdit}
            onRedButtonClick={handleDelete}
          />
        ),
      },
    ];
  }, [router]);

  const tableData = useMemo(() => {
    if (paymentAccount?.result) {
      const { cards, bank_accounts } = paymentAccount.result;
      return [
        ...cards?.map((card) => ({
          paymentType: `${capitalizeFirstLetter(card.funding)} Card`,
          endingNumber: `* ${card.last_digits}`,
          paymentNickname: card.nickname,
          menu: { id: card.id, type: "card" },
        })),
        ...bank_accounts?.map((account) => ({
          paymentType: "Bank Account",
          endingNumber: `* ${account.last_digits}`,
          paymentNickname: account.nickname,
          menu: { id: account.id, type: "bank_account" },
        })),
      ];
    } else return [];
  }, [paymentAccount]);

  return (
    <>
      <Head>
        <title>Wallet | Workeaser</title>
      </Head>

      <div className={styles.walletContainer}>
        <section className={styles.buttonContainer}>
          <Link href="/settings/wallet/add">
            <Button text="ADD PAYMENT ACCOUNT" color="primary" />
          </Link>
        </section>
        <section>
          <StyledTable
            columns={columns}
            data={tableData ?? []}
            columnsWidth={[20, 24, 54, 2]}
          />
        </section>
      </div>
    </>
  );
};

Wallet.authRoles = ["COWORKING"];
Wallet.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <CoworkingLayout componentProps={componentProps}>
      <SettingsLayout>{page}</SettingsLayout>
    </CoworkingLayout>
  );
};
export default Wallet;
