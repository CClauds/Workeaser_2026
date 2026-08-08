import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function FinancesPage() { return (<Shell><Head><title>Finances | Workeaser</title></Head>
  <h1 className="text-[24px] font-bold text-[#2B3450] mb-2">Finances</h1>
  <p className="text-[13px] text-on-surface-variant mb-6">Accounting layer (QBO reconciliation, financial reports, account statements). Anchor for QuickBooks integration (B10).</p>
  <div className="bg-surface border border-border rounded-lg p-12 text-center text-outline text-[14px]">Finances module — pending implementation (B10).<br/>Will connect to QuickBooks Online for reconciliation and financial reporting.</div>
</Shell>); }
