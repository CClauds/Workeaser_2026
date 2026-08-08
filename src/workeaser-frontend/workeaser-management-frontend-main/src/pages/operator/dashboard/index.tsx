import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function DashboardPage() {
  const { data: clients } = useFetch<any>('/cowork/v2/clients?perPage=1');
  const { data: invoices } = useFetch<any>('/cowork/finance/invoices?perPage=1');
  const clientCount = clients?.meta?.total ?? 240;
  const kpis = [
    {label:'Active Locations',value:'10',icon:'business',color:'#00A2DD'},
    {label:'Active Members',value:String(clientCount),icon:'people',color:'#10B981'},
    {label:'Receivable Income',value:'$800.00',icon:'payments',color:'#2B3450'},
    {label:'Pending Items',value:'0',icon:'pending_actions',color:'#F59E0B'},
    {label:'Overdue',value:'1',icon:'warning',color:'#EF4444'},
  ];
  return (<Shell><Head><title>Dashboard | Workeaser</title></Head>
    <div className="flex items-center justify-between mb-6"><h1 className="text-[24px] font-bold text-[#2B3450]">Dashboard</h1>
      <div className="flex gap-2"><button className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer border-none"><span className="material-symbols-outlined text-[18px]">add</span>Add Client</button>
      <button className="flex items-center gap-1.5 bg-surface border border-border text-on-surface-variant px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer"><span className="material-symbols-outlined text-[18px]">download</span>Export Report</button></div>
    </div>
    <div className="grid grid-cols-5 gap-4 mb-6">{kpis.map(kpi=>{const c=kpi.color;return(<div key={kpi.label} className="bg-surface border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-[20px]" style={{color:c}}>{kpi.icon}</span><span className="text-[11px] uppercase tracking-wider text-outline font-semibold">{kpi.label}</span></div>
      <div className="text-[28px] font-bold text-[#2B3450]">{kpi.value}</div>
    </div>)})}</div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-3"><span className="material-symbols-outlined text-[20px]">bar_chart</span>Clients per Product Category</h3><div className="text-[13px] text-on-surface-variant text-center py-8">Virtual Office 0 · Meeting Room 0 · Open Desk 0 · Private Room 0</div></div>
      <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-3"><span className="material-symbols-outlined text-[20px]">pie_chart</span>Invoices per Status</h3><div className="text-[13px] text-on-surface-variant text-center py-8">Overdue: 1 · No active invoices</div></div>
    </div>
    <div className="bg-surface border border-border rounded-lg p-5"><h3 className="flex items-center gap-2 text-[14px] font-semibold text-[#2B3450] mb-3"><span className="material-symbols-outlined text-[20px]">flag</span>Clients with Pending Items</h3>
    <table className="w-full text-[13px] border-collapse"><thead><tr className="text-left border-b-2 border-border text-[11px] text-outline uppercase"><th className="p-3">Client</th><th className="p-3">Company</th><th className="p-3">Pending Item</th><th className="p-3">Priority</th><th className="p-3"></th></tr></thead>
    <tbody><tr><td colSpan={5} className="text-center text-outline py-6">No pending items</td></tr></tbody></table></div>
  </Shell>);
}
