import { SubscriptionButton } from "@components/Subscription/Button";
import { SubscriptionCard } from "@components/Subscription/Card";
import { SubscriptionSummary } from "@components/Subscription/Summary";
import Head from "next/head";
import { ReactElement } from "react";

import { ClientLayout } from "@components/Layouts/ClientLayout";
import { SettingsLayout } from "@components/Layouts/SettingsLayout";
import { PagesProps } from "pages/_app";
import styles from "../styles.module.scss";

const Subscriptions = () => {
  return (
    <>
      <Head>
        <title>Subscriptions | Workeaser</title>
      </Head>

      <div className={styles.subscriptionsContainer}>
        <section>
          <SubscriptionSummary>
            <p>
              You have <strong>00</strong> Desk Visits Remaining
            </p>
          </SubscriptionSummary>

          <SubscriptionSummary>
            <p>
              You have <strong>00</strong> Meeting Hours Remaining
            </p>
          </SubscriptionSummary>
        </section>
        <section>
          <SubscriptionCard
            value={0}
            title="Desks Visits per Month"
            subtitle="Cost per Visit: "
            cost={17}
          />
          <SubscriptionCard
            value={0}
            title="Meeting Hours per Month"
            subtitle="Cost per hour: "
            cost={17}
          />
        </section>
        <section className={styles.footer}>
          <SubscriptionButton>UPGRADE ACCOUNT</SubscriptionButton>
          <a>DOWNGRADE ACCOUNT</a>
        </section>
      </div>
    </>
  );
};

Subscriptions.authRoles = ["CLIENT"];
Subscriptions.getLayout = (page: ReactElement, componentProps: PagesProps) => {
  return (
    <ClientLayout componentProps={componentProps}>
      <SettingsLayout title="Account Settings" role="CLIENT">
        {page}
      </SettingsLayout>
    </ClientLayout>
  );
};
export default Subscriptions;
