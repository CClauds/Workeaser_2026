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

export default function ChatPage() {
  const { data } = useFetch<any>('/cowork/chats');
  const chats = data?.data ?? data?.result ?? [];

  return (<OperatorLayout><Head><title>Chat | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 8 }}>Communication — Chat</h1>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:20}}>Chat (Omnichat) — read-only. Activation pending B7/B8.</p>
      <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        {Array.isArray(chats) && chats.length>0 ? (<table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Client</th><th style={{padding:'8px 10px'}}>Messages</th></tr></thead>
          <tbody>{chats.map((c:any)=><tr key={c.uuid} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px'}}>{c.clientAccount?.company_name||'—'}</td><td style={{padding:'8px 10px'}}>{c.messages?.length||0}</td></tr>)}</tbody></table>):<p style={{textAlign:'center',color:'#94a3b8',padding:20}}>No chat conversations found.</p>}
      </div>
    </div></OperatorLayout>);
}
