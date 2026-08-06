import { Button } from "@components/Button";
import { LocationHeader } from "@components/Headers/LocationHeader";
import { PageHeader } from "@components/Headers/PageHeader";
import { Layout } from "@components/Layouts/Layout";
import { useFetch } from "hooks/useFetch";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LocationResponse } from "types/locations";

const LocationsProductsAndServices = ({}) => {
  const router = useRouter();
  const { id } = router.query;
  const { data: { result: { location: location } = {} } = {} } =
    useFetch<LocationResponse>(`/cowork/locations/${id}`);

  return (
    <>
      <Head>
        <title>Products &amp; Services | Workeaser</title>
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

        <div></div>
      </Layout>
    </>
  );
};

export default LocationsProductsAndServices;
