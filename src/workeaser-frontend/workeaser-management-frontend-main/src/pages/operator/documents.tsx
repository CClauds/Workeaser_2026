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

export default function DocumentsPage() {
  const { data: photos } = useFetch<any>('/photos?perPage=25');
  const items = photos?.data ?? photos?.result ?? [];

  return (<OperatorLayout><Head><title>Documents | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 8 }}>Documents</h1>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:20}}>Local Drive — read-only. Google Drive integration pending B7.</p>
      <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        {Array.isArray(items) && items.length>0 ? (<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>File</th><th style={{padding:'8px 10px'}}>Uploaded</th></tr></thead>
          <tbody>{items.map((d:any)=><tr key={d.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px'}}>{d.file||d.name||'—'}</td><td style={{padding:'8px 10px'}}>{d.created_at||'—'}</td></tr>)}</tbody></table>):<p style={{textAlign:'center',color:'#94a3b8',padding:20}}>No documents found.</p>}
      </div>
    </div></OperatorLayout>);
}
