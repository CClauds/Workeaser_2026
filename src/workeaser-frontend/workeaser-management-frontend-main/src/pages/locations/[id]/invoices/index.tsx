import { Button } from "@components/Button";
import { LocationHeader } from "@components/Headers/LocationHeader";
import { PageHeader } from "@components/Headers/PageHeader";
import { Table } from "@components/Table";
import { TableHead } from "@components/Table/TableHead";
import { Layout } from "components/Layouts/Layout";
import { useFetch } from "hooks/useFetch";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LocationResponse } from "types/locations";
import styles from "../styles.module.scss";

const LocationInvoices = ({}) => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { result: { location: location } = {} } = {} } =
    useFetch<LocationResponse>(`/cowork/locations/${id}`);

  return (
    <>
      <Head>
        <title>Invoices | Workeaser</title>
      </Head>

      <Layout>
        <PageHeader>
          <div>
            <h1>
              <Link href="/locations/veneusmanagement">Locations</Link>
            </h1>
            <h2>Manage Location</h2>
            <h2>{location?.name}</h2>
          </div>

          <Link
            href={{
              pathname: `/locations/add`,
              query: { id: location?.id },
            }}
          >
            <Button text="Edit Location" color="secondary" />
          </Link>
        </PageHeader>

        <LocationHeader id={location?.id} />

        <div className={styles.content}>
          <Table>
            <colgroup>
              <col width="10%" />
              <col width="10%" />
              <col width="38%" />
              <col width="14%" />
              <col width="14%" />
              <col width="14%" />
              <col width="2%" />
            </colgroup>
            <TableHead>
              <th>Invoice ID</th>
              <th>Due Date</th>
              <th>Client Name</th>
              <th className={styles.textCenter}>Balance Status</th>
              <th className={styles.textCenter}>Invoice Amount</th>
              <th className={styles.textCenter}>Open Amount</th>
              <th></th>
            </TableHead>
          </Table>
        </div>
      </Layout>
    </>
  );
};

export default LocationInvoices;
