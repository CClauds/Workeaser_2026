import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { parseCookies } from 'nookies';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function ContractsPage() {
  const { data: clients } = useFetch<any>('/cowork/v2/clients?perPage=100');
  const list = (clients?.data ?? clients?.result ?? []) as any[];
  const allContracts = list.flatMap((c: any) => (c.serviceContracts || []).map((sc: any) => ({ ...sc, client: c })));

  return (<OperatorLayout><Head><title>All Contracts | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', margin: 0 }}>All Contracts</h1>
        <Link href="/operator/contracts/new" style={{ background: '#00A2DD', color: '#fff', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>+ New Contract</Link>
      </div>
      <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 12, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
        New Contract generator (Kimmi-style) — pending B4.
      </div>
      <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Client</th><th style={{padding:'8px 10px'}}>Service</th><th style={{padding:'8px 10px'}}>Room</th><th style={{padding:'8px 10px'}}>Channel</th><th style={{padding:'8px 10px'}}>Status</th></tr></thead>
          <tbody>{allContracts.map((sc:any)=><tr key={sc.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{sc.client?.company_name||sc.client?.contact_first_name||'—'}</td><td style={{padding:'8px 10px'}}>{sc.serviceType?.name||'—'}</td><td style={{padding:'8px 10px'}}>{sc.roomsUnit?.display_name||'—'}</td><td style={{padding:'8px 10px'}}><span style={{padding:'2px 8px',borderRadius:10,fontSize:11,background:sc.billing_channel==='DIRECT'?'#dbeafe':'#fef3c7',color:sc.billing_channel==='DIRECT'?'#1e40af':'#92400e'}}>{sc.billing_channel}</span></td><td style={{padding:'8px 10px'}}>{sc.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div></OperatorLayout>);
}
