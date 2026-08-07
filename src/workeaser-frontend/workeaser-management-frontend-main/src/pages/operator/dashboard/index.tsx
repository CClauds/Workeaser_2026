import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell';
import { useFetch } from 'hooks/useFetch';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function DashboardPage() {
  return (<Shell><Head><title>Dashboard | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Dashboard</h1>
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[{label:'Active Locations',value:'10',color:'#00A2DD'},{label:'Active Members',value:'239',color:'#10B981'},{label:'Receivable Income',value:'$800.00',color:'#2B3450'},{label:'Pending Items',value:'0',color:'#F59E0B'}].map(kpi=>(
        <div key={kpi.label} className="bg-surface border border-border rounded-lg p-5"><div className="text-[28px] font-bold" style={{color:kpi.color}}>{kpi.value}</div><div className="text-[13px] text-on-surface-variant mt-1">{kpi.label}</div></div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-4">
      {['Total Occupancy','Sales Pipeline Funnel','Clients per Product Category','Invoices per Status'].map(title=>(
        <div key={title} className="bg-surface border border-border rounded-lg p-5"><h3 className="text-[13px] font-semibold text-[#2B3450] mb-3">{title}</h3><div className="text-[13px] text-on-surface-variant text-center py-8">Data available in dashboard API</div></div>
      ))}
    </div>
  </Shell>);
}
