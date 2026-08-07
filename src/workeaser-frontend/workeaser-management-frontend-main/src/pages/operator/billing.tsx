import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function BillingPage() {
  const { data } = useFetch<any>('/cowork/finance/invoices?perPage=25'); const invoices=data?.data??data?.result??[];
  return (<Shell><Head><title>Billing & Payments | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Billing &amp; Payments</h1>
    <div className="flex gap-2 mb-4">{['Invoices','Payments (Mark Paid)','Partner Billing'].map(t=><button key={t} className="px-4 py-2 text-[13px] font-medium border-b-2 border-primary text-primary bg-transparent cursor-pointer">{t}</button>)}</div>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">ID</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
    <tbody>{Array.isArray(invoices)&&invoices.length>0?invoices.map((i:any)=><tr key={i.id} className="border-b border-border"><td className="p-3">#{i.id}</td><td className="p-3">{i.date||'—'}</td><td className="p-3">${((i.total||0)/100).toFixed(2)}</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">{i.status||'—'}</span></td></tr>):<tr><td colSpan={4} className="p-6 text-center text-outline">No invoices found.</td></tr>}</tbody></table></div>
  </Shell>);
}
