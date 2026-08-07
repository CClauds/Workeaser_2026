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

export default function UsersRolesPage() {
  const { data } = useFetch<any>('/cowork/v2/setup/users');
  const users: any[] = Array.isArray(data) ? data : [];

  return (<OperatorLayout><Head><title>Users & Roles | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 8 }}>Users &amp; Roles</h1>
      <p style={{color:'#94a3b8',fontSize:13,marginBottom:20}}>Management of operator users and role assignment. Pending: create user form (B3-C next iteration).</p>
      <div style={{background:'#fff',padding:20,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Name</th><th style={{padding:'8px 10px'}}>Email</th><th style={{padding:'8px 10px'}}>Role</th><th style={{padding:'8px 10px'}}>Modules</th></tr></thead>
          <tbody>{users.map((u:any)=><tr key={u.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{u.first_name} {u.last_name}</td><td style={{padding:'8px 10px'}}>{u.email}</td><td style={{padding:'8px 10px'}}><span style={{padding:'2px 8px',borderRadius:10,fontSize:11,background:u.role==='ADMIN'?'#dbeafe':'#dcfce7',color:u.role==='ADMIN'?'#1e40af':'#166534'}}>{u.role}</span></td><td style={{padding:'8px 10px'}}>{(u.modules||[]).join(', ')||'—'}</td></tr>)}</tbody>
        </table>
      </div>
    </div></OperatorLayout>);
}
