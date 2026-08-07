import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function BillingPage() {
  const { data } = useFetch<any>('/cowork/finance/invoices?perPage=25');
  const invoices = data?.data ?? data?.result ?? [];

  return (<OperatorLayout><Head><title>Billing & Payments | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 8 }}>Billing &amp; Payments</h1>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:20}}>Invoices — read-only. Payments (Mark Paid) and Partner Billing pending B5/B6.</p>
      <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>ID</th><th style={{padding:'8px 10px'}}>Date</th><th style={{padding:'8px 10px'}}>Total</th><th style={{padding:'8px 10px'}}>Status</th></tr></thead>
          <tbody>{Array.isArray(invoices) && invoices.length>0 ? invoices.map((inv:any)=><tr key={inv.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px'}}>#{inv.id}</td><td style={{padding:'8px 10px'}}>{inv.date||'—'}</td><td style={{padding:'8px 10px'}}>${((inv.total||0)/100).toFixed(2)}</td><td style={{padding:'8px 10px'}}>{inv.status||'—'}</td></tr>):<tr><td colSpan={4} style={{padding:20,textAlign:'center',color:'#94a3b8'}}>No invoices found.</td></tr>}</tbody>
        </table>
      </div>
    </div></OperatorLayout>);
}
