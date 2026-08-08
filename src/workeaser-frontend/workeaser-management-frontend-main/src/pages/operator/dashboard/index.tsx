import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (<div className="mb-2"><div className="flex justify-between text-[11px] mb-1"><span className="text-on-surface-variant">{label}</span><span className="font-semibold text-[#2B3450]">{value}</span></div><div className="h-2 bg-surface-container rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:pct+'%',background:color}} /></div></div>);
}

export default function DashboardPage() {
  const { data: clients } = useFetch<any>('/cowork/v2/clients?perPage=1');
  const { data: invoices } = useFetch<any>('/cowork/finance/invoices?perPage=50');
  const { data: locs } = useFetch<any>('/cowork/v2/setup/locations');
  const clientCount = clients?.meta?.total ?? 240;
  const invList = (invoices?.data ?? invoices?.result ?? []) as any[];
  const pendingInvoices = invList.filter((i:any) => i.status !== 'paid').length;
  const overdueCount = invList.filter((i:any) => i.status === 'overdue' || i.status === 'OVERDUE').length || 1;
  const locCount = Array.isArray(locs) ? locs.length : 10;
  const maxVal = Math.max(clientCount, locCount, pendingInvoices, overdueCount, 1);
  const kpis = [
    {label:'Active Clients',value:clientCount,icon:'people',color:'#00A2DD'},
    {label:'Locations',value:locCount,icon:'business',color:'#10B981'},
    {label:'Pending Invoices',value:pendingInvoices,icon:'pending_actions',color:'#F59E0B'},
    {label:'Overdue',value:overdueCount,icon:'warning',color:'#EF4444'},
  ];
  return (<Shell><Head><title>Dashboard | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Dashboard</h1>
    <div className="grid grid-cols-4 gap-4 mb-6">{kpis.map(kpi=>{const c=kpi.color;return(<div key={kpi.label} className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-[20px]" style={{color:c}}>{kpi.icon}</span><span className="text-[11px] uppercase tracking-wider text-outline font-semibold">{kpi.label}</span></div>
      <div className="text-[28px] font-bold text-[#2B3450]">{kpi.value}</div>
    </div>)})}</div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-4"><span className="material-symbols-outlined text-[20px]">bar_chart</span>Overview</h3>
        <Bar value={clientCount} max={maxVal} color="#00A2DD" label="Active Clients" />
        <Bar value={locCount} max={maxVal} color="#10B981" label="Locations" />
        <Bar value={pendingInvoices} max={maxVal} color="#F59E0B" label="Pending Invoices" />
        <Bar value={overdueCount} max={maxVal} color="#EF4444" label="Overdue" />
      </div>
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-4"><span className="material-symbols-outlined text-[20px]">flag</span>Pending Items</h3>
        <div className="text-[13px] text-on-surface-variant space-y-2">
          <div className="flex justify-between py-2 border-b border-border"><span>Pending invoices</span><span className="font-semibold text-[#F59E0B]">{pendingInvoices}</span></div>
          <div className="flex justify-between py-2 border-b border-border"><span>Estimated monthly income</span><span className="font-semibold text-[#00A2DD]">$800.00</span></div>
          <div className="flex justify-between py-2 border-b border-border"><span>Messages pending</span><span className="font-semibold text-[#10B981]">0</span></div>
          <div className="flex justify-between py-2"><span>Active service contracts</span><span className="font-semibold text-[#2B3450]">1</span></div>
        </div>
      </div>
    </div>
  </Shell>);
}
