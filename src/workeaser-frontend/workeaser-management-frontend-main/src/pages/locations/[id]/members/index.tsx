import { Button } from "@components/Button";
import { LocationHeader } from "@components/Headers/LocationHeader";
import { PageHeader } from "@components/Headers/PageHeader";
import { Layout } from "@components/Layouts/Layout";
import { Table } from "@components/Table";
import { TableHead } from "@components/Table/TableHead";
import { useFetch } from "hooks/useFetch";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LocationResponse } from "types/locations";
import styles from "../styles.module.scss";

export default function LocationMembers({}) {
  const router = useRouter();
  const { id } = router.query;
  const { data: { result: { location: location } = {} } = {} } =
    useFetch<LocationResponse>(`/cowork/locations/${id}`);

  return (
    <>
      <Head>
        <title>Members | Workeaser</title>
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
              <col width="13%" />
              <col width="24%" />
              <col width="23%" />
              <col width="18%" />
              <col width="20%" />
              <col width="2%" />
            </colgroup>
            <TableHead>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Company Name</th>
              <th className={styles.textCenter}>Contracted Services</th>
              <th className={styles.textCenter}>Balance Status</th>
              <th></th>
            </TableHead>

            <tbody className={styles.tableBody}>
              {/* {members?.map((member) => (
              <Row key={member.id}>
                <td>{member.id}</td>
                <td className={styles.name}>{member.name}</td>
                <td className={styles.companyName}>{member.companyName}</td>
                <td></td>
                <td className={styles.textCenter}>
                  <StatusContainer>{member.balanceStatus}</StatusContainer>
                </td>
                <td></td>
              </Row>
            ))} */}
            </tbody>
          </Table>
        </div>
      </Layout>
    </>
  );
}
