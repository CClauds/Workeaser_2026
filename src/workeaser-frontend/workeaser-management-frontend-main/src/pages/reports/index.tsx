import { OptionsButton } from "@components/Button/OptionsButton";
import { MenuWrapper } from "@components/DotsMenu/MenuWrapper";
import { FilterButton } from "@components/Filters/FilterButton";
import { DatePickerAntd } from "@components/FormElements/DatePicker";
import { PageHeader } from "@components/Headers/PageHeader";
import { CalendarIcon, Download } from "@components/Icons";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { StyledTable } from "@components/Table/StyledTable";
import { api } from "@services/api";
import { FilterDateContainer } from "@styles/pages/reports";
import { errorHandler } from "@utils/errors";
import { AxiosRequestConfig } from "axios";
import dayjs from "dayjs";
import Head from "next/head";
import { PagesProps } from "pages/_app";
import { ReactElement, useMemo, useState } from "react";

interface ReportType {
  name: string;
  category: string;
  slug: string;
}

const ReportsObj = [
  {
    name: "Approved Bookings",
    category: "Locations & Occupancy",
    slug: "approvedbookings",
  },
  {
    name: "Day Passes",
    category: "Locations & Occupancy",
    slug: "daypasseslisting",
  },
  {
    name: "Leads Listing",
    category: "Leads & Marketing",
    slug: "leadslisting",
  },
  {
    name: "Visitors Listing",
    category: "Leads & Marketing",
    slug: "visitorslisting",
  },
  {
    name: "Contract Renewals",
    category: "Clients & Contracts",
    slug: "contractrenewals",
  },
  {
    name: "Members Listing",
    category: "Clients & Contracts",
    slug: "memberslisting",
  },
  {
    name: "Invoices Overview",
    category: "Invoices, Banking & Taxes",
    slug: "invoicesoverview",
  },
  {
    name: "Revenue by Location",
    category: "Invoices, Banking & Taxes",
    slug: "revenuebylocation",
  },
  {
    name: "Revenue by Member",
    category: "Invoices, Banking & Taxes",
    slug: "revenuebymember",
  },
  // {
  //   name: "Transaction History per Bank",
  //   category: "Invoices, Banking & Taxes",
  //   slug: "transactionhistory",
  // },
];

const Reports = () => {
  const [reportLoading, setReportLoading] = useState<string>("");
  const [reportDate, setReportDate] = useState({
    start: dayjs().date(1).format("YYYY-MM-DD"),
    end: dayjs()
      .month(dayjs().month() + 1)
      .date(0)
      .format("YYYY-MM-DD"),
  });

  const handleDownload = async (
    report: ReportType,
    handleClose: () => void
  ) => {
    handleClose();
    setReportLoading(report.slug);

    const reportUrl = `/cowork/reports/${report.slug}?start_date=${reportDate.start}&end_date=${reportDate.end}`;
    const config: AxiosRequestConfig<any> = {
      method: "GET",
      responseType: "blob",
    };

    let blobUrl: string | undefined;
    let link: HTMLAnchorElement | undefined;

    try {
      const response = await api.get(reportUrl, config);

      blobUrl = window.URL.createObjectURL(response.data);
      link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `${report.name}_${reportDate.start}-${reportDate.end}.xlsx`
      );
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      errorHandler(err);
    } finally {
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
      setReportLoading("");
    }
  };

  const columns = useMemo(() => {
    return [
      {
        Header: "Report Name",
        accessor: "name",
      },
      {
        Header: "Data Category",
        accessor: "category",
      },
      {
        Header: "Last Download",
        accessor: "lastDownload",
      },
      {
        Header: "",
        accessor: "menu",
        Cell: ({ value }: { value: ReportType }) => (
          <MenuWrapper loading={reportLoading === value.slug}>
            {(handleClose) => (
              <>
                <OptionsButton
                  onClick={() => handleDownload(value, handleClose)}
                  icon={<Download />}
                >
                  DOWNLOAD REPORT
                </OptionsButton>
              </>
            )}
          </MenuWrapper>
        ),
      },
    ];
  }, [reportDate]);

  const tableData = useMemo(
    () =>
      ReportsObj.map((report) => ({
        name: report.name,
        category: report.category,
        lastDownload: "",
        menu: report,
      })),
    []
  );

  return (
    <>
      <Head>
        <title>Reports | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Reports</h1>
        </div>

        <div>
          <FilterButton theme="secondary">
            <FilterDateContainer>
              <p>Date Range:</p>

              <div>
                <CalendarIcon />
                <label htmlFor="From">From:</label>
                <DatePickerAntd
                  id="From"
                  onDateChange={(date) =>
                    setReportDate({ ...reportDate, start: date })
                  }
                />
                <label htmlFor="To">To:</label>
                <DatePickerAntd
                  id="To"
                  onDateChange={(date) =>
                    setReportDate({ ...reportDate, end: date })
                  }
                />
              </div>
            </FilterDateContainer>
          </FilterButton>
        </div>
      </PageHeader>

      <div>
        <StyledTable columns={columns} data={tableData ?? []} />
      </div>
    </>
  );
};

Reports.getLayout = (page: ReactElement, componentsProps: PagesProps) => (
  <CoworkingLayout componentProps={componentsProps}>{page}</CoworkingLayout>
);
export default Reports;
