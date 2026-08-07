import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function UsersPage() {
  const { data } = useFetch<any>('/cowork/v2/setup/users'); const users:any[]=Array.isArray(data)?data:[];
  return (<Shell><Head><title>Users & Roles | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Users &amp; Roles</h1>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Modules</th></tr></thead>
    <tbody>{users.map((u:any)=><tr key={u.id} className="border-b border-border"><td className="p-3 font-medium">{u.first_name} {u.last_name}</td><td className="p-3">{u.email}</td><td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${u.role==='ADMIN'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800'}`}>{u.role}</span></td><td className="p-3">{(u.modules||[]).join(', ')||'—'}</td></tr>)}</tbody></table></div>
  </Shell>);
}
