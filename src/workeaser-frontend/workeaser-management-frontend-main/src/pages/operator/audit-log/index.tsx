import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function AuditLogPage() {
  const { data } = useFetch<any>('/cowork/v2/audit-log?perPage=50'); const logs = (data?.data ?? data?.result ?? []) as any[];
  return (<Shell><Head><title>Audit Log | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-2">Audit Log</h1>
    <p className="text-[13px] text-on-surface-variant mb-6">Access and operation records by user. Read-only — security control.</p>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Timestamp</th><th className="p-3">User</th><th className="p-3">Action</th><th className="p-3">Module</th><th className="p-3">Details</th></tr></thead>
    <tbody>{logs.length>0?logs.map((l:any,i:number)=><tr key={i} className="border-b border-border"><td className="p-3">{l.created_at||l.createdAt||'—'}</td><td className="p-3">{l.user_name||l.userId||'—'}</td><td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${l.action==='LOGIN_SUCCESS'?'bg-green-100 text-green-800':l.action?.includes('DELETE')?'bg-red-100 text-red-800':'bg-blue-100 text-blue-800'}`}>{l.action||'—'}</span></td><td className="p-3">{l.module||'—'}</td><td className="p-3 text-outline text-[12px]">{l.details||l.message||'—'}</td></tr>):<tr><td colSpan={5} className="text-center text-outline py-10">No audit records found. Logging infrastructure pending.</td></tr>}</tbody></table></div></div>
  </Shell>);
}
