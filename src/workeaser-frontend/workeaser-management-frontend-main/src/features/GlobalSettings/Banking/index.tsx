import { Button } from "@components/Button";
import { ConfirmationModal } from "@components/Modals/ConfirmationModal";
import { StatusIcon } from "@components/Table/Row/StatusIcon";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import { toast } from "react-toastify";
import { BankingHeader, BankingTable, Container } from "./styles";

interface TokenResponse {
  result: {
    token: string;
  };
}
interface BankingResponse {
  result: Banking[];
}
interface Banking {
  id: number;
  nickname: string;
  banking_name: string;
  last_digits: string;
  is_main_account: number;
}

export const Banking: React.FC = () => {
  const [plaidToken, setPlaidToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Banking>();

  const { data: { result: bankings } = {}, mutate } = useFetch<BankingResponse>(
    "/cowork/settings/banking"
  );

  // const effectRun = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const fetchPlaidToken = async () => {
      const config = {
        signal: controller.signal,
      };

      const { data } = await api.get<TokenResponse>(
        "/cowork/settings/banking/token",
        config
      );
      setPlaidToken(data.result.token);
    };

    // if (effectRun.current) {
    fetchPlaidToken();
    // }
    return () => {
      controller.abort();
      // effectRun.current = true;
    };
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      const { accounts, institution } = metadata;

      setIsLoading(true);

      try {
        const [account] = accounts;

        if (!account) {
          throw new Error("No account found.");
        }

        const body = {
          token: publicToken,
          account_id: account.id,
          nickname: institution.name,
          is_main_account: true,
        };

        await api.post("/cowork/settings/banking", body);
        toast.success("Account added.");
        mutate();
      } catch (error) {
        if (error.message) {
          toast.error(error.message);
          return;
        }
        if (error.response.data) {
          if (!Array.isArray(error?.response?.data.error.message)) {
            toast.error(error?.response?.data.error.message);
          } else {
            error?.response?.data.error.message.forEach((message) => {
              toast.error(message.message);
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const { open, ready } = usePlaidLink({
    token: plaidToken,
    onSuccess,
  });

  const handleDeleteAccount = async () => {
    toast.success("Account Deleted.");
    setIsModalOpen(false);
    mutate(
      { result: bankings.filter((bank) => bank.id !== currentAccount.id) },
      false
    );

    await api.delete(`/cowork/settings/banking/${currentAccount.id}`);

    mutate();
  };

  const columns = useMemo(() => {
    const handleDeleteAccount = async (id: number) => {
      const account = bankings.find((account) => account.id === id);
      setCurrentAccount(account);
      setIsModalOpen(true);
    };

    return [
      {
        Header: "Bank Name",
        accessor: "name",
      },
      {
        Header: "Ending Number",
        accessor: "number",
        className: "align__center",
      },
      {
        Header: "Main Account",
        accessor: "mainAccount",
        className: "align__center",
        Cell: ({ value }) => <StatusIcon status={value} />,
      },
      {
        Header: "",
        accessor: "action",
        className: "flex__center",
        Cell: ({ value }: { value: number }) => (
          <Button
            text="DELETE"
            color="plain"
            className="delete__button"
            onClick={() => handleDeleteAccount(value)}
          />
        ),
      },
    ];
  }, [bankings]);

  const tableData = useMemo(
    () =>
      bankings?.map((account) => ({
        name: account.banking_name,
        number: account.last_digits,
        mainAccount: account.is_main_account === 1 ? true : false,
        action: account.id,
      })),
    [bankings]
  );

  return (
    <Container>
      <BankingHeader>
        <div>
          <h3>Linked Bank Accounts:</h3>
          <p>Connect your bank account to be able to track transitions.</p>
        </div>

        <Button
          text="ADD NEW ACCOUNT"
          onClick={() => open()}
          disabled={!ready}
          loading={isLoading}
        />
      </BankingHeader>

      <BankingTable>
        <StyledTable columns={columns} data={tableData ?? []} />

        {/* <p>
          * Select one account which will be your Main Account. This account
          will be receiving the deposits from you payment system.
        </p> */}
      </BankingTable>

      <ConfirmationModal
        title="Delete integration"
        text={`Are you sure you want to delete ${currentAccount?.nickname} account?`}
        onConfirm={handleDeleteAccount}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </Container>
  );
};
