import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function Page() { return (<Shell><Head><title>Documents | Workeaser</title></Head>
  <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Documents</h1>
  <div className="bg-surface border border-border rounded-lg p-12 text-center text-outline text-[13px]">Documents — read-only from existing data. Full functionality pending future block.</div>
</Shell>); }
