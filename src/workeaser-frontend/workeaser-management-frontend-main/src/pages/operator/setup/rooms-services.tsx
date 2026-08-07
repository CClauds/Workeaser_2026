import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch'; import { api } from '@services/api'; import { useState } from 'react'; import { toast } from 'react-toastify';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function RoomsPage() {
  const [tab,setTab]=useState<'rooms'|'locations'|'types'>('rooms'); const {data:rooms,mutate}=useFetch<any>('/cowork/v2/setup/rooms'); const {data:locs}=useFetch<any>('/cowork/v2/setup/locations'); const {data:types}=useFetch<any>('/cowork/v2/setup/service-types'); const [form,setForm]=useState<any>({});
  const rl:any[]=rooms??[]; const ll:any[]=locs??[]; const tl:any[]=types??[];
  const create=async()=>{try{await api.post('/cowork/v2/setup/rooms',form);mutate();toast.success('Room created');setForm({});}catch{toast.error('Failed')}};
  const del=async(id:number)=>{if(!confirm('Delete?'))return;await api.delete('/cowork/v2/setup/rooms/'+id);mutate();toast.success('Deleted')};
  const tabBtn=(t:string,l:string)=>(<button onClick={()=>setTab(t as any)} className={`px-4 py-2 text-[13px] font-medium cursor-pointer border-b-2 ${tab===t?'border-primary text-primary':'border-transparent text-outline'}`}>{l}</button>);
  return (<Shell><Head><title>Locations, Rooms & Services | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-4">Locations, Rooms &amp; Services</h1>
    <div className="flex gap-0 mb-4">{tabBtn('rooms','Rooms & Units')}{tabBtn('locations','Locations')}{tabBtn('types','Service Types')}</div>
    {tab==='rooms'&&<div className="bg-surface border border-border rounded-lg p-5 mb-4">
      <h3 className="text-[16px] font-semibold text-[#2B3450] mb-3">Add Room (Venus 101 model)</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <select value={form.location_id||''} onChange={e=>setForm({...form,location_id:e.target.value})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none"><option value="">Location *</option>{ll.map((l:any)=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <select value={form.service_type_id||''} onChange={e=>setForm({...form,service_type_id:e.target.value})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none"><option value="">Service Type *</option>{tl.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <input placeholder="Room Number *" value={form.room_number||''} onChange={e=>setForm({...form,room_number:e.target.value})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none" />
        <input placeholder="Display Name *" value={form.display_name||''} onChange={e=>setForm({...form,display_name:e.target.value})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none" />
        <input type="number" placeholder="Size (sq ft)" value={form.size_sqft||''} onChange={e=>setForm({...form,size_sqft:Number(e.target.value)})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none" />
        <input type="number" placeholder="Base Price (cents) *" value={form.base_price_cents||''} onChange={e=>setForm({...form,base_price_cents:Number(e.target.value)})} className="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none" />
      </div>
      <button onClick={create} className="bg-primary text-on-primary px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer border-none">+ Add Room</button>
      <table className="w-full text-[13px] border-collapse mt-4"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Room</th><th className="p-3">Location</th><th className="p-3">Type</th><th className="p-3">Price</th><th className="p-3"></th></tr></thead>
      <tbody>{rl.map((r:any)=><tr key={r.id} className="border-b border-border"><td className="p-3 font-medium">{r.display_name} <span className="text-outline">({r.room_number})</span></td><td className="p-3">{r.location?.name}</td><td className="p-3">{r.serviceType?.name}</td><td className="p-3">${((r.base_price_cents||0)/100).toFixed(2)}</td><td className="p-3"><button onClick={()=>del(r.id)} className="text-error bg-transparent border border-error rounded px-2 py-1 text-[11px] cursor-pointer">Delete</button></td></tr>)}</tbody></table>
    </div>}
    {tab==='locations'&&<div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th></tr></thead><tbody>{ll.map((l:any)=><tr key={l.id} className="border-b border-border"><td className="p-3 font-medium">{l.name}</td><td className="p-3">{l.email||'—'}</td><td className="p-3">{l.phone||'—'}</td></tr>)}</tbody></table></div>}
    {tab==='types'&&<div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Pricing</th></tr></thead><tbody>{tl.map((t:any)=><tr key={t.id} className="border-b border-border"><td className="p-3 font-medium">{t.name}</td><td className="p-3">{t.slug}</td><td className="p-3"><span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-800">{t.pricing_logic}</span></td></tr>)}</tbody></table></div>}
  </Shell>);
}
