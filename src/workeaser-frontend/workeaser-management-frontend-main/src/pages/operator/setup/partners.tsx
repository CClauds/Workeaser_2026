import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { api } from '@services/api';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function PartnersPage() {
  const { data, mutate } = useFetch<any>('/cowork/v2/setup/resellers');
  const [form, setForm] = useState<any>({});
  const [editing, setEditing] = useState<number | null>(null);
  const partners: any[] = data ?? [];

  const handleSave = async () => {
    try {
      if (editing) { await api.put(`/cowork/v2/setup/resellers/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/cowork/v2/setup/resellers', form); toast.success('Created'); }
      mutate(); setForm({}); setEditing(null);
    } catch { toast.error('Failed to save'); }
  };
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this partner?')) return;
    await api.delete(`/cowork/v2/setup/resellers/${id}`); mutate(); toast.success('Deleted');
  };
  const handleEdit = (p: any) => { setForm({ name: p.name, slug: p.slug, contact_name: p.contact_name, contact_email: p.contact_email, commission_bps: p.commission_bps }); setEditing(p.id); };

  const iStyle: any = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, width: '100%' };
  const s: any = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  return (<OperatorLayout><Head><title>Partners | Workeaser</title></Head>
    <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 20 }}>Partners (Resellers)</h1>
      <div style={s}><h3 style={{margin:'0 0 12px',fontSize:16,fontWeight:600,color:'#2B3450'}}>{editing ? 'Edit Partner' : 'Add Partner'}</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
          <div><label style={{fontSize:11,color:'#64748b'}}>Name *</label><input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} style={iStyle}/></div>
          <div><label style={{fontSize:11,color:'#64748b'}}>Slug *</label><input value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})} style={iStyle}/></div>
          <div><label style={{fontSize:11,color:'#64748b'}}>Contact Name</label><input value={form.contact_name||''} onChange={e=>setForm({...form,contact_name:e.target.value})} style={iStyle}/></div>
          <div><label style={{fontSize:11,color:'#64748b'}}>Contact Email</label><input value={form.contact_email||''} onChange={e=>setForm({...form,contact_email:e.target.value})} style={iStyle}/></div>
          <div><label style={{fontSize:11,color:'#64748b'}}>Commission (bps)</label><input type="number" value={form.commission_bps||''} onChange={e=>setForm({...form,commission_bps:Number(e.target.value)})} style={iStyle}/></div>
        </div>
        <button onClick={handleSave} style={{background:'#00A2DD',color:'#fff',border:'none',padding:'8px 20px',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:600,marginRight:8}}>{editing?'Update':'Create'}</button>
        {editing && <button onClick={()=>{setForm({});setEditing(null);}} style={{background:'#fff',border:'1px solid #cbd5e1',padding:'8px 16px',borderRadius:6,cursor:'pointer',fontSize:13}}>Cancel</button>}
      </div>
      <div style={s}><h3 style={{margin:'0 0 12px',fontSize:16,fontWeight:600,color:'#2B3450'}}>All Partners ({partners.length})</h3>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Name</th><th style={{padding:'8px 10px'}}>Contact</th><th style={{padding:'8px 10px'}}>Commission</th><th style={{padding:'8px 10px'}}>Clients</th><th style={{padding:'8px 10px'}}></th></tr></thead>
          <tbody>{partners.map((p:any)=><tr key={p.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{p.name}</td><td style={{padding:'8px 10px'}}>{p.contact_name||'—'}<br/><span style={{fontSize:11,color:'#94a3b8'}}>{p.contact_email||''}</span></td><td style={{padding:'8px 10px'}}>{(p.commission_bps/100).toFixed(2)}%</td><td style={{padding:'8px 10px'}}>{p.$extras?.serviceContracts_count ?? '—'}</td><td style={{padding:'8px 10px'}}><button onClick={()=>handleEdit(p)} style={{background:'none',border:'1px solid #00A2DD',color:'#00A2DD',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11,marginRight:4}}>Edit</button><button onClick={()=>handleDelete(p.id)} style={{background:'none',border:'1px solid #dc2626',color:'#dc2626',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>Delete</button></td></tr>)}</tbody>
        </table></div>
    </div></OperatorLayout>);
}
