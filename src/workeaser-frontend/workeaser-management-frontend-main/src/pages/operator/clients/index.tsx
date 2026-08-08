import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch'; import { useState } from 'react'; import { api } from '@services/api';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };

function ClientModal({ client, onClose }: { client?: any; onClose: () => void }) {
  if (!client) return null;
  const contracts = client.serviceContracts || [];
  const actionBtns = [
    {label:'Documents',icon:'folder',color:'#3B82F6'},
    {label:'Contracts',icon:'description',color:'#00A2DD'},
    {label:'Payments',icon:'payments',color:'#10B981'},
    {label:'Pending',icon:'pending_actions',color:'#F59E0B'},
    {label:'Messages',icon:'chat',color:'#8B5CF6'},
  ];
  return (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
    <div className="bg-surface rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div><h2 className="text-[20px] font-semibold text-[#2B3450]">{client.contact_first_name} {client.contact_last_name}</h2>
        <p className="text-[13px] text-outline">{client.company_name}{client.ein?' · EIN: '+client.ein:''}</p></div>
        <button onClick={onClose} className="text-outline hover:text-on-surface text-[24px] leading-none">&times;</button>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-6">{actionBtns.map(b=>(<button key={b.label} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface text-[12px] font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-low"><span className="material-symbols-outlined text-[16px]" style={{color:b.color}}>{b.icon}</span>{b.label}</button>))}</div>
        <div className="grid grid-cols-2 gap-3 text-[13px] mb-6">{[{l:'Company',v:client.company_name},{l:'Email',v:client.company_email||client.contact_email},{l:'Phone',v:client.company_phone||client.contact_phone},{l:'PMB',v:client.pmb_number},{l:'EIN',v:client.ein},{l:'Address',v:client.address},{l:'Notes',v:client.notes}].map(r=>(<div key={r.l}><span className="text-outline">{r.l}:</span> <span className="text-on-surface">{r.v||'—'}</span></div>))}</div>
        <h3 className="text-[14px] font-semibold text-[#2B3450] mb-3">Service Contracts ({contracts.length})</h3>
        <table className="w-full text-[13px] border-collapse"><thead><tr className="text-left border-b-2 border-border text-[11px] text-outline uppercase"><th className="p-2">Service</th><th className="p-2">Room</th><th className="p-2">Period</th><th className="p-2">Rate</th><th className="p-2">Channel</th><th className="p-2">Status</th></tr></thead>
        <tbody>{contracts.map((sc:any)=>(<tr key={sc.id} className="border-b border-border"><td className="p-2 font-medium">{sc.serviceType?.name||'—'}</td><td className="p-2">{sc.roomsUnit?.display_name||'—'}</td><td className="p-2 text-[12px]">{sc.startedAt?new Date(sc.startedAt).toLocaleDateString():'—'} — {sc.endedAt?new Date(sc.endedAt).toLocaleDateString():'open'}</td><td className="p-2">${((sc.price_cents||0)/100).toFixed(2)}</td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.billing_channel==='DIRECT'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{sc.billing_channel==='DIRECT'?'EWS (Direct)':sc.reseller?.name||'Reseller'}</span></td><td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{sc.status}</span></td></tr>))}</tbody></table>
        {contracts.length===0&&<p className="text-outline text-center py-6">No active services. Add a service contract to get started.</p>}
      </div>
    </div>
  </div>);
}

export default function AllClientsPage() {
  const [search,setSearch]=useState(''); const [selected,setSelected]=useState<any>(null);
  const [addOpen,setAddOpen]=useState(false);
  const { data } = useFetch<any>('/cowork/v2/clients?perPage=100'+(search?'&search='+search:''));
  const clients = (data?.data ?? data?.result ?? []) as any[];
  return (<Shell><Head><title>All Clients | Workeaser</title></Head>
    <div className="flex justify-between items-center mb-6"><h1 className="text-[24px] font-bold text-[#2B3450]">Clients</h1>
      <button onClick={()=>setAddOpen(true)} className="flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-[14px] font-semibold cursor-pointer border-none"><span className="material-symbols-outlined text-[18px]">add</span>Add Client</button></div>
    <div className="flex gap-3 mb-4 items-center"><div className="relative flex-1"><span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span><input type="search" placeholder="Search by company, name, phone, service, room, notes..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-3.5 py-2.5 border border-outline-variant rounded-lg text-[14px] outline-none" /></div></div>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Client</th><th className="p-3">Company</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Services</th><th className="p-3">Room</th><th className="p-3">Status</th><th className="p-3 w-10"></th></tr></thead>
    <tbody>{clients.map((c:any)=>{const sc=c.serviceContracts||[];const f=sc[0];return(<tr key={c.id} className="border-b border-border cursor-pointer hover:bg-surface-container-low"><td className="p-3 font-medium" onClick={()=>setSelected(c)}><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-semibold text-primary">{(c.contact_first_name||'?')[0]}{(c.contact_last_name||'?')[0]}</div>{c.contact_first_name} {c.contact_last_name}</div></td><td className="p-3">{c.company_name||'—'}</td><td className="p-3">{c.company_email||c.contact_email||'—'}</td><td className="p-3">{c.company_phone||c.contact_phone||'—'}</td><td className="p-3">{sc.map((s:any)=>s.serviceType?.name).filter(Boolean).join(', ')||'—'}</td><td className="p-3">{f?.roomsUnit?.display_name||'—'}</td><td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${f?.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{f?.status||'No services'}</span></td><td className="p-3"><span className="material-symbols-outlined text-[18px] text-outline cursor-pointer" onClick={(e)=>{e.stopPropagation();setSelected(c)}}>more_vert</span></td></tr>)})}</tbody></table>
    {clients.length===0&&<p className="text-outline text-center py-10">No clients found.</p>}</div>
    {selected&&<ClientModal client={selected} onClose={()=>setSelected(null)}/>}
    {addOpen&&<AddClientModal onClose={()=>{setAddOpen(false)}}/>}
  </Shell>);
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const [saving,setSaving]=useState(false); const [form,setForm]=useState<any>({});
  const [contracts,setContracts]=useState<any[]>([{service_type_id:'',rooms_unit_id:'',price_cents:0,billing_channel:'DIRECT',reseller_id:'',started_at:new Date().toISOString().slice(0,10)}]);
  const {data:svc}=useFetch<any>('/cowork/v2/setup/service-types'); const {data:rooms}=useFetch<any>('/cowork/v2/setup/rooms'); const {data:res}=useFetch<any>('/cowork/v2/setup/resellers');
  const resellers=(res??[]) as any[];
  const submit=async(e:any)=>{e.preventDefault();setSaving(true);try{await api.post('/cowork/v2/clients',{...form,contracts});onClose();window.location.reload()}catch{setSaving(false)}};
  const addRow=()=>setContracts([...contracts,{service_type_id:'',rooms_unit_id:'',price_cents:0,billing_channel:'DIRECT',reseller_id:'',started_at:new Date().toISOString().slice(0,10)}]);
  const rmRow=(i:number)=>{if(contracts.length===1)return;setContracts(contracts.filter((_,j)=>j!==i))};
  const updC=(i:number,f:string,v:any)=>{const c=[...contracts];c[i]={...c[i],[f]:v};setContracts(c)};
  const iS="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none w-full";
  return (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}><div className="bg-surface rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="p-6 border-b border-border flex justify-between items-center"><h2 className="text-[18px] font-semibold text-[#2B3450]">Add Client</h2><button onClick={onClose} className="text-outline hover:text-on-surface text-[24px] leading-none">&times;</button></div><div className="p-6"><form onSubmit={submit}>
    <div className="mb-4"><h3 className="text-[14px] font-semibold text-[#2B3450] mb-3">Client Information</h3><div className="grid grid-cols-2 gap-3">{['company_name','contact_first_name','contact_last_name','company_email','contact_email','company_phone','contact_phone','pmb_number'].map(f=><input key={f} placeholder={f.replace(/_/g,' ').replace(/\b\w/g,(c:string)=>c.toUpperCase())} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})} className={iS} />)}<input placeholder="Address (US format)" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} className={iS} /><input placeholder="EIN (Tax ID)" value={form.ein||''} onChange={e=>setForm({...form,ein:e.target.value})} className={iS} /></div><textarea placeholder="Notes / Observations" value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} className={`${iS} mt-3 min-h-[60px]`} /></div>
    <div className="mb-4"><div className="flex justify-between items-center mb-3"><h3 className="text-[14px] font-semibold text-[#2B3450]">Service Contracts</h3><button type="button" onClick={addRow} className="bg-primary text-on-primary px-3 py-1.5 rounded text-[13px] font-semibold cursor-pointer border-none">+ Add Service</button></div>{contracts.map((c,i)=><div key={i} className="border border-border rounded-md p-3 mb-2 grid grid-cols-4 gap-2"><select value={c.service_type_id} onChange={e=>updC(i,'service_type_id',e.target.value)} className={iS}><option value="">Service Type *</option>{(svc||[]).map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={c.rooms_unit_id} onChange={e=>updC(i,'rooms_unit_id',e.target.value)} className={iS}><option value="">Room (optional)</option>{(rooms||[]).map((r:any)=><option key={r.id} value={r.id}>{r.display_name} ({r.room_number})</option>)}</select><input type="number" placeholder="Price (cents)" value={c.price_cents||''} onChange={e=>updC(i,'price_cents',Number(e.target.value))} className={iS} />
    <select value={c.billing_channel==='DIRECT'?'DIRECT':c.reseller_id?`RESELLER_${c.reseller_id}`:'DIRECT'} onChange={e=>{const v=e.target.value;if(v==='DIRECT')updC(i,'billing_channel','DIRECT');else{updC(i,'billing_channel','RESELLER');updC(i,'reseller_id',v.replace('RESELLER_',''))}}} className={iS}><option value="DIRECT">EWS (Direct)</option>{resellers.map((r:any)=><option key={r.id} value={`RESELLER_${r.id}`}>{r.name}</option>)}</select>
    <input type="date" value={c.started_at||''} onChange={e=>updC(i,'started_at',e.target.value)} className={iS} /><button type="button" onClick={()=>rmRow(i)} className="text-error bg-transparent border border-error rounded px-2 py-1 text-[11px] cursor-pointer">Remove</button></div>)}</div>
    <div className="flex gap-3"><button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-md text-[14px] font-semibold cursor-pointer border-none disabled:opacity-50">{saving?'Saving...':'Save Client'}</button><button type="button" onClick={onClose} className="bg-surface border border-border px-6 py-2.5 rounded-md text-[14px] cursor-pointer">Cancel</button></div></form></div></div></div>);
}
