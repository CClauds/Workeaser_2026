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

export default function RoomsServicesPage() {
  const [tab, setTab] = useState<'rooms'|'locations'|'types'>('rooms');
  const { data: rooms, mutate: rm } = useFetch<any>('/cowork/v2/setup/rooms');
  const { data: locations } = useFetch<any>('/cowork/v2/setup/locations');
  const { data: types } = useFetch<any>('/cowork/v2/setup/service-types');
  const [form, setForm] = useState<any>({});

  const roomsList: any[] = rooms ?? [];
  const locs: any[] = locations ?? [];
  const svcTypes: any[] = types ?? [];

  const handleCreateRoom = async () => {
    try { await api.post('/cowork/v2/setup/rooms', form); rm(); toast.success('Room created'); setForm({}); }
    catch { toast.error('Failed to create room'); }
  };
  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Delete this room?')) return;
    await api.delete(`/cowork/v2/setup/rooms/${id}`); rm(); toast.success('Room deleted');
  };

  const s: any = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
  const iStyle: any = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, width: '100%' };

  const tabBtn = (t: typeof tab, label: string) => (
    <button key={t} onClick={() => setTab(t)} style={{
      padding: '8px 20px', border: '1px solid #e2e8f0', background: tab===t?'#00A2DD':'#fff',
      color: tab===t?'#fff':'#2B3450', cursor:'pointer', fontWeight:tab===t?600:400, fontSize:13,
    }}>{label}</button>
  );

  return (
    <OperatorLayout>
      <Head><title>Locations, Rooms & Services | Workeaser</title></Head>
      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 16 }}>Locations, Rooms &amp; Services</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {tabBtn('rooms','Rooms & Units')}{tabBtn('locations','Locations (10)')}{tabBtn('types','Service Types (6)')}
        </div>

        {tab === 'rooms' && (<div style={s}><h3 style={{margin:'0 0 12px',fontSize:16,fontWeight:600,color:'#2B3450'}}>Rooms &amp; Units</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
            <div><label style={{fontSize:11,color:'#64748b'}}>Location *</label><select value={form.location_id||''} onChange={e=>setForm({...form,location_id:e.target.value})} style={iStyle}><option value="">Select...</option>{locs.map((l:any)=><option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Service Type *</label><select value={form.service_type_id||''} onChange={e=>setForm({...form,service_type_id:e.target.value})} style={iStyle}><option value="">Select...</option>{svcTypes.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Room Number *</label><input value={form.room_number||''} onChange={e=>setForm({...form,room_number:e.target.value})} style={iStyle} placeholder="101"/></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Display Name *</label><input value={form.display_name||''} onChange={e=>setForm({...form,display_name:e.target.value})} style={iStyle} placeholder="Venus 101"/></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Size (sq ft)</label><input type="number" value={form.size_sqft||''} onChange={e=>setForm({...form,size_sqft:e.target.value})} style={iStyle}/></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Capacity</label><input type="number" value={form.capacity||''} onChange={e=>setForm({...form,capacity:e.target.value})} style={iStyle}/></div>
            <div><label style={{fontSize:11,color:'#64748b'}}>Base Price (cents) *</label><input type="number" value={form.base_price_cents||''} onChange={e=>setForm({...form,base_price_cents:Number(e.target.value)})} style={iStyle}/></div>
          </div>
          <button onClick={handleCreateRoom} style={{background:'#00A2DD',color:'#fff',border:'none',padding:'8px 20px',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:600}}>+ Add Room</button>
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:16,fontSize:13}}>
            <thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Room</th><th style={{padding:'8px 10px'}}>Location</th><th style={{padding:'8px 10px'}}>Type</th><th style={{padding:'8px 10px'}}>Size</th><th style={{padding:'8px 10px'}}>Price</th><th style={{padding:'8px 10px'}}></th></tr></thead>
            <tbody>{roomsList.map((r:any)=><tr key={r.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{r.display_name} <span style={{color:'#94a3b8'}}>({r.room_number})</span></td><td style={{padding:'8px 10px'}}>{r.location?.name}</td><td style={{padding:'8px 10px'}}>{r.serviceType?.name}</td><td style={{padding:'8px 10px'}}>{r.size_sqft?`${r.size_sqft} sqft`:'—'}</td><td style={{padding:'8px 10px'}}>${((r.base_price_cents||0)/100).toFixed(2)}</td><td style={{padding:'8px 10px'}}><button onClick={()=>handleDeleteRoom(r.id)} style={{background:'none',border:'1px solid #dc2626',color:'#dc2626',borderRadius:4,padding:'2px 8px',cursor:'pointer',fontSize:11}}>Delete</button></td></tr>)}</tbody>
          </table></div>)}

        {tab === 'locations' && (<div style={s}><h3 style={{margin:'0 0 12px',fontSize:16,fontWeight:600,color:'#2B3450'}}>Locations</h3>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Name</th><th style={{padding:'8px 10px'}}>Email</th><th style={{padding:'8px 10px'}}>Phone</th></tr></thead>
          <tbody>{locs.map((l:any)=><tr key={l.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{l.name}</td><td style={{padding:'8px 10px'}}>{l.email||'—'}</td><td style={{padding:'8px 10px'}}>{l.phone||'—'}</td></tr>)}</tbody></table></div>)}

        {tab === 'types' && (<div style={s}><h3 style={{margin:'0 0 12px',fontSize:16,fontWeight:600,color:'#2B3450'}}>Service Types</h3>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr style={{textAlign:'left',borderBottom:'2px solid #e2e8f0',fontSize:11,color:'#64748b',textTransform:'uppercase'}}><th style={{padding:'8px 10px'}}>Name</th><th style={{padding:'8px 10px'}}>Slug</th><th style={{padding:'8px 10px'}}>Pricing</th></tr></thead>
          <tbody>{svcTypes.map((t:any)=><tr key={t.id} style={{borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 10px',fontWeight:500}}>{t.name}</td><td style={{padding:'8px 10px'}}>{t.slug}</td><td style={{padding:'8px 10px'}}><span style={{padding:'2px 8px',borderRadius:10,fontSize:11,background:'#dbeafe',color:'#1e40af'}}>{t.pricing_logic}</span></td></tr>)}</tbody></table></div>)}
      </div>
    </OperatorLayout>
  );
}
