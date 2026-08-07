import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function Page() { return (<Shell><Head><title>new | Workeaser</title></Head>
  <div className="flex items-center justify-between mb-6"><h1 className="text-[24px] font-bold text-[#2B3450]">new</h1></div>
  <div className="bg-surface border border-border rounded-lg p-12 text-center"><div className="text-[48px] mb-4 opacity-20">🚧</div><p className="text-[14px] text-on-surface-variant">This section is scheduled for implementation in a future block. The data model is ready.</p><p className="text-[12px] text-outline mt-2">Backend schema deployed · Frontend pending</p></div>
</Shell>); }
