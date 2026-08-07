import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function Page() {
  const title = (typeof window !== 'undefined' && (window as any).__pageTitle) || 'Workeaser';
  return (
    <OperatorLayout>
      <Head><title>{title}</title></Head>
      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif", textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🚧</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#2B3450' }}>{title}</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>
          This section is scheduled for a future block. Data model ready — implementation pending.
        </p>
      </div>
    </OperatorLayout>
  );
}
