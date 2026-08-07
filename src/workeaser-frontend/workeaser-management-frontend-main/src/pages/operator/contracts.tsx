import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch'; import Link from 'next/link';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function ContractsPage() {
  const { data } = useFetch<any>('/cowork/v2/clients?perPage=100'); const clients=(data?.data??data?.result??[]) as any[];
  const contracts=clients.flatMap((c:any)=>(c.serviceContracts||[]).map((sc:any)=>({...sc,client:c})));
  return (<Shell><Head><title>All Contracts | Workeaser</title></Head>
    <div className="flex justify-between items-center mb-6"><h1 className="text-[24px] font-bold text-[#2B3450]">All Contracts</h1><Link href="/operator/contracts/new" className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-[14px] font-semibold no-underline">+ New Contract</Link></div>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Client</th><th className="p-3">Service</th><th className="p-3">Room</th><th className="p-3">Channel</th><th className="p-3">Status</th></tr></thead>
    <tbody>{contracts.map((sc:any)=><tr key={sc.id} className="border-b border-border"><td className="p-3 font-medium">{sc.client?.company_name||sc.client?.contact_first_name||'—'}</td><td className="p-3">{sc.serviceType?.name||'—'}</td><td className="p-3">{sc.roomsUnit?.display_name||'—'}</td><td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.billing_channel==='DIRECT'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{sc.billing_channel}</span></td><td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{sc.status}</span></td></tr>)}</tbody></table></div>
  </Shell>);
}
