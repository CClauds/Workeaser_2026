import { Button } from "@components/Button";
import { BankingOptions } from "@components/DotsMenu/BankingOptions";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { SelectComponent } from "@components/FormElements/Select";
import { PageHeader } from "@components/Headers/PageHeader";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { AddCommentModal } from "@components/Modals/AddComment";
import { EditableCell } from "@components/Table/Cell/EditableCell";
import { StatusContainer } from "@components/Table/Row/StatusContainer";
import { StyledTable } from "@components/Table/StyledTable";
import { useFetch } from "@hooks/useFetch";
import { api } from "@services/api";
import { getAPIClient } from "@services/apiClient";
import { formatDate } from "@utils/numberFormat";
import Money from "dinero.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { parseCookies } from "nookies";
import { PagesProps } from "pages/_app";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { ColumnInstance, ColumnInterface, Row as RowType } from "react-table";
import { toast } from "react-toastify";
import { Fallback } from "types";
import {
  BankingsResponse,
  Transaction,
  TransactionResponse,
} from "types/cowork/financial";
import {
  TransactionCategory,
  TransationFilter,
} from "types/cowork/financial/enums";
import { OptionType } from "types/form";
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

  try {
    const { data: bankings } = await apiClient.get<BankingsResponse>(
      "/cowork/settings/banking"
    );

    if (!bankings.result.length) {
      return {
        props: {
          fallbackBankings: {},
          fallbackTransactions: {},
          fallbackTransactionsNextPage: {},
        },
      };
    }
    const { data: transactions } = await apiClient.get<TransactionResponse>(
      `/cowork/finance/banking/${bankings.result[0].id}?status=NEW&page=1`
    );

    let nextPageResponse: { data: TransactionResponse };
    if (transactions.pagination.lastPage > 1) {
      nextPageResponse = await apiClient.get<TransactionResponse>(
        `/cowork/finance/banking/${bankings.result[0].id}?status=NEW&page=2`
      );
    }

    return {
      props: {
        fallbackBankings: {
          "/cowork/settings/banking": bankings,
        },
        fallbackTransactions: {
          [`/cowork/finance/banking/${bankings.result[0].id}?status=NEW&page=1`]:
            transactions,
        },
        fallbackTransactionsNextPage: {
          [`/cowork/finance/banking/${bankings.result[0].id}?status=NEW&page=2`]:
            nextPageResponse?.data ?? {},
        },
      },
    };
  } catch (error) {
    return {
      props: {
        error: error,
        fallbackBankings: {},
        fallbackTransactions: {},
        fallbackTransactionsNextPage: {},
      },
    };
  }
};

type Filter = keyof typeof TransationFilter;

interface BankingProps {
  fallbackBankings: Fallback;
  fallbackTransactions: Fallback;
  fallbackTransactionsNextPage: Fallback;
}
const Banking = ({
  fallbackBankings,
  fallbackTransactions,
  fallbackTransactionsNextPage,
}: BankingProps) => {
  const [reload, setReload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);
  const [selectedTransaction, setSelectedTransaction] = useState<number>();
  const [selectedFilter, setSelectedFilter] = useState<Filter>("NEW");
  const [isAddCommentModalOpen, setIsAddCommentModalOpen] = useState(false);
  const [skipPageReset, setSkipPageReset] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<{
    [key: string]: Transaction[];
  }>();
  const [pageSize, setPageSize] = useState(10);

  const firstRender = useRef(true);

  const { data: { result: bankings } = {} } = useFetch<BankingsResponse>(
    "/cowork/settings/banking",
    {
      fallback: fallbackBankings,
    }
  );

  const { data: { result: transactions, pagination } = {}, mutate } =
    useFetch<TransactionResponse>(
      bankings?.length
        ? `/cowork/finance/banking/${bankings[selectedBankIndex].id}?status=${selectedFilter}&page=${pageCount}`
        : null,
      {
        fallback: fallbackTransactions,
      }
    );

  const {
    data: {
      result: transactionsNextPage,
      pagination: { page: nextPage } = {},
    } = {},
  } = useFetch<TransactionResponse>(
    bankings?.length
      ? `/cowork/finance/banking/${
          bankings[selectedBankIndex].id
        }?status=${selectedFilter}&page=${pageCount + 1}`
      : null,
    { fallback: fallbackTransactionsNextPage }
  );

  const selectedBank = bankings ? bankings[selectedBankIndex]?.id : null;
  const lastPage = Math.ceil(pagination?.total / pageSize);

  // useEffect(() => {
  //   if (bankings?.length) {
  //     setSelectedBank(bankings[0].id);
  //   }
  // }, [bankings]);

  useEffect(() => {
    // console.log({ selectedBank, transactions, transactionsNextPage });
    if (transactions) {
      if (firstRender.current) {
        setData(transactions.slice(0, pageSize));
        firstRender.current = false;
      }

      setAllTransactions({
        ...allTransactions,
        [pagination.page]: transactions,
      });

      const startRow = pageSize * pageIndex;
      const endRow = startRow + pageSize;

      const all: { [key: string]: Transaction[] } = {
        ...allTransactions,
        [pagination.page]: transactions,
      };

      if (reload) {
        setSkipPageReset(false);
        setData(Object.values(all).flat().slice(startRow, endRow));
      }

      setReload(false);

      setSkipPageReset(true);

      if (transactionsNextPage?.length) {
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;

        const all: { [key: string]: Transaction[] } = {
          ...allTransactions,
          [pagination.page]: transactions,
          [nextPage]: transactionsNextPage,
        };

        if (reload) {
          setSkipPageReset(false);
          setData(Object.values(all).flat().slice(startRow, endRow));
        }

        setReload(false);
        setSkipPageReset(true);
        setAllTransactions(all);
      }
    }
  }, [transactions, transactionsNextPage]);

  const handleFetchData = (pageIndex: number, pageSize: number) => {
    setPageSize(pageSize);
    setPageIndex(pageIndex);
    if (allTransactions) {
      const startRow = pageSize * pageIndex;
      const endRow = startRow + pageSize;
      const flattenData = Object.values(allTransactions).flat();
      setData(flattenData.slice(startRow, endRow));
      // console.table({ endRow, flatle: flattenData.length, pagination });
      // if (endRow >= flattenData.length - pagination.perPage) {
      //   setPageCount(pagination.page + 1);
      // }
    }
  };

  const handleBankChange = (option: OptionType) => {
    if (option.value !== selectedBank) {
      setReload(true);
      setAllTransactions(null);
      setPageCount(1);
      const bankIndex = bankings.findIndex((bank) => bank.id === option.value);
      setSelectedBankIndex(bankIndex);
    }
  };
  const handleFilterChange = (option: OptionType) => {
    if (option.value !== selectedFilter) {
      setReload(true);
      setAllTransactions(null);
      setPageCount(1);
      setSelectedFilter(option.value as Filter);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setReload(true);
    setPageCount(1);
    setAllTransactions(null);
    // const selected = selectedBank;
    // setSelectedBank(null);
    await api.post(`/cowork/finance/banking/${selectedBank}/sync`);
    mutate();
    setIsRefreshing(false);
    // setSelectedBank(selected);
  };

  const columns: ColumnInterface[] = useMemo(() => {
    const handleAddNote = async (id: number) => {
      setSelectedTransaction(id);
      setIsAddCommentModalOpen(true);
      setReload(true);
    };
    const handleRecordTransaction = async (id: number) => {
      try {
        await api.put(
          `/cowork/finance/banking/${bankings[selectedBankIndex].id}/${id}/record`
        );
        toast.success("Transaction recorded.");
        setReload(true);
        mutate();
      } catch (error) {
        console.log({ error });
      } finally {
        setSkipPageReset(false);
      }
    };
    const handleVoidTransaction = async (id: number) => {
      try {
        await api.put(
          `/cowork/finance/banking/${bankings[selectedBankIndex].id}/${id}/void`
        );
        toast.success("Transaction voided.");
        setReload(true);
        mutate();
      } catch (error) {
        console.log({ error });
      }
    };
    const updateMyData = async (
      rowIndex: number,
      columnId: string,
      value: TransactionCategory,
      row: RowType
    ) => {
      setSkipPageReset(true);
      const category =
        Object.keys(TransactionCategory)[
          Object.values(TransactionCategory).indexOf(value)
        ] ?? value;
      const {
        values: { id },
      } = row;
      if (value.length) {
        try {
          await api.put(
            `/cowork/finance/banking/${bankings[selectedBankIndex].id}/${id}/category`,
            {
              category,
            }
          );

          toast.success("Category Updated.");
          mutate();
        } catch (error) {
          console.log({ error });
        }
      }
    };
    return [
      {
        Header: "",
        accessor: "id",
      },
      {
        Header: "Date",
        accessor: "date",
        Cell: ({ value }: { value: string }) => formatDate(new Date(value)),
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Customer / Payee",
        accessor: "customer",
      },
      {
        Header: "Transaction Category",
        accessor: "transactionCategory",
        type: "datalist",
        Cell: ({
          column,
          row,
          value,
        }: {
          row: RowType;
          column: ColumnInstance;
          value: string;
        }) => (
          <EditableCell
            value={value}
            options={Object.keys(TransactionCategory).map((filter) => ({
              value: filter,
              label: TransactionCategory[filter],
            }))}
            column={column}
            row={row}
            updateMyData={updateMyData}
          />
        ),
      },
      {
        Header: "Spent",
        accessor: "spent",
        className: "align__center",
        Cell: ({ value }: { value: number }) =>
          value === 0 ? null : (
            <StatusContainer bgColor="red">
              {Money({ amount: value }).toFormat("$0,0.00")}
            </StatusContainer>
          ),
      },
      {
        Header: "Received",
        accessor: "received",
        className: "align__center",
        Cell: ({ value }: { value: number }) =>
          value === 0 ? null : (
            <StatusContainer bgColor="green">
              {Money({ amount: value }).toFormat("$0,0.00")}
            </StatusContainer>
          ),
      },
      {
        Header: "",
        accessor: "menu",
        disableSortBy: true,
        Cell: ({ value }: { value: number }) => (
          <MenuWrapper>
            <BankingOptions
              onAddNote={() => handleAddNote(value)}
              onRecordTransaction={() => handleRecordTransaction(value)}
              onVoidTransaction={() => handleVoidTransaction(value)}
            />
          </MenuWrapper>
        ),
      },
    ];
  }, [data]);

  const tableData = useMemo(
    () =>
      data?.map((transaction) => ({
        id: transaction.id,
        date: transaction.date,
        description: transaction.description ?? "",
        customer: transaction.customer ?? "",
        transactionCategory: TransactionCategory[transaction.category] ?? "",
        spent: transaction.spent ?? 0,
        received: transaction.received ?? 0,
        menu: transaction.id,
      })),
    [data]
  );

  return (
    <>
      <Head>
        <title>Banking | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Finances</h1>
          <h2>Banking</h2>
        </div>

        <div className={styles.header__row}>
          <SelectComponent
            width={200}
            onChange={handleBankChange}
            options={bankings?.map((account) => ({
              value: account.id,
              label: account.nickname,
            }))}
          />
          <Button
            text="Refresh"
            onClick={handleRefresh}
            loading={isRefreshing}
          />
          <SelectComponent
            width={200}
            onChange={handleFilterChange}
            options={Object.keys(TransationFilter).map((filter) => ({
              value: filter,
              label: TransationFilter[filter],
            }))}
          />
        </div>
      </PageHeader>

      <div className={styles.tableContainer}>
        <StyledTable
          columns={columns}
          data={tableData ?? []}
          columnsWidth={[12, 24, 24, 12, 13, 13, 2]}
          pageCount={lastPage ?? 1}
          fetchData={handleFetchData}
          skipPageReset={skipPageReset}
          hiddenColumns={["id"]}
        />
      </div>

      <AddCommentModal
        currnetBank={selectedBank}
        currentTransaction={selectedTransaction}
        currrentFilter={selectedFilter}
        isOpen={isAddCommentModalOpen}
        mutate={mutate}
        onRequestClose={() => setIsAddCommentModalOpen(false)}
      />
    </>
  );
};

Banking.getLayout = (page: ReactElement, componentProps: PagesProps) => (
  <CoworkingLayout componentProps={componentProps}>{page}</CoworkingLayout>
);
export default Banking;
