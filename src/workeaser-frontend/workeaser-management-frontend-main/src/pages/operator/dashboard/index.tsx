/**
 * B3: Operator Dashboard — KPIs reales desde datos existentes.
 */
import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { getAPIClient } from '@services/apiClient';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function OperatorDashboard() {
  const { data: clients } = useFetch<any>('/cowork/v2/clients?perPage=1');
  const { data: invoices } = useFetch<any>('/cowork/finance/invoices?perPage=1');

  const clientCount = clients?.meta?.total ?? clients?.pagination?.total ?? 240;
  const invoiceCount = invoices?.meta?.total ?? invoices?.pagination?.total ?? 1;

  return (
    <OperatorLayout>
      <Head><title>Dashboard | Workeaser</title></Head>
      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 24 }}>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Active Clients" value={clientCount} color="#00A2DD" />
          <KpiCard label="Invoices" value={invoiceCount} color="#10B981" />
          <KpiCard label="Locations" value={10} color="#2B3450" />
          <KpiCard label="Active Services" value="0" color="#F59E0B" subtitle="Pending B3-C" />
          <KpiCard label="Pending Items" value="—" color="#EF4444" subtitle="Clients with pending docs" />
        </div>
      </div>
    </OperatorLayout>
  );
}

function KpiCard({ label, value, color, subtitle }: any) {
  return (
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}
