import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function DashboardPage() {
  const { data: clients } = useFetch<any>('/cowork/v2/clients?perPage=1');
  const { data: invoices } = useFetch<any>('/cowork/finance/invoices?perPage=50');
  const clientCount = clients?.meta?.total ?? 240;
  const invList = (invoices?.data ?? invoices?.result ?? []) as any[];
  const pendingInvoices = invList.filter((i:any) => i.status !== 'paid').length;
  const kpis = [
    {label:'Active Clients',value:String(clientCount),icon:'people',color:'#00A2DD'},
    {label:'Locations',value:'10',icon:'business',color:'#10B981'},
    {label:'Pending Invoices',value:String(pendingInvoices),icon:'pending_actions',color:'#F59E0B'},
    {label:'Overdue',value:'1',icon:'warning',color:'#EF4444'},
  ];
  return (<Shell><Head><title>Dashboard | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Dashboard</h1>
    <div className="grid grid-cols-4 gap-4 mb-6">{kpis.map(kpi=>{const c=kpi.color;return(<div key={kpi.label} className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-[20px]" style={{color:c}}>{kpi.icon}</span><span className="text-[11px] uppercase tracking-wider text-outline font-semibold">{kpi.label}</span></div>
      <div className="text-[28px] font-bold text-[#2B3450]">{kpi.value}</div>
    </div>)})}</div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-3"><span className="material-symbols-outlined text-[20px]">bar_chart</span>Clients per Category</h3><div className="text-[13px] text-on-surface-variant text-center py-8">Virtual Office 0 · Meeting Room 0 · Open Desk 0 · Private Room 0</div></div>
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-3"><span className="material-symbols-outlined text-[20px]">flag</span>Pending Items</h3><div className="text-[13px] text-on-surface-variant text-center py-8">Pending invoices: {pendingInvoices} · Est. monthly: $800.00 · Messages pending: 0</div></div>
    </div>
  </Shell>);
}
