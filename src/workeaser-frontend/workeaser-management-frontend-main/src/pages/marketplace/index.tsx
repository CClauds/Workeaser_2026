import { Header } from "@components/Header";
import { MarketplaceHeader } from "@components/Headers/MarketplaceHeader";
import { Thumbnail } from "@components/Thumbnail";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import styles from "./styles.module.scss";

const Map = dynamic(() => import("@components/Map"), {
  loading: function load() {
    return <Loader />;
  },
  ssr: false,
});

const Loader = () => <p>Loading...</p>;

const MarketPlace: React.FC = () => {
  return (
    <>
      <Head>
        <title>Marketplace</title>
      </Head>
      <Header hasSidebar />
      <MarketplaceHeader />
      <main className={styles.container}>
        <aside>
          <div>
            <Thumbnail url="" size={80} alt="" />
          </div>
        </aside>
        <div className={styles.mapContainer}>
          <Map />
        </div>
      </main>
    </>
  );
};

export default MarketPlace;
