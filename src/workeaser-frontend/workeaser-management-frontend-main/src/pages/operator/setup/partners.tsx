import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch'; import { api } from '@services/api'; import { useState } from 'react'; import { toast } from 'react-toastify';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function PartnersPage() {
  const { data, mutate } = useFetch<any>('/cowork/v2/setup/resellers'); const [form,setForm]=useState<any>({}); const [edit,setEdit]=useState<number|null>(null);
  const list:any[] = data ?? [];
  const save = async () => { try { if(edit){await api.put('/cowork/v2/setup/resellers/'+edit,form);toast.success('Updated');}else{await api.post('/cowork/v2/setup/resellers',form);toast.success('Created');} mutate(); setForm({}); setEdit(null); } catch { toast.error('Failed'); } };
  const iS="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none w-full";
  return (<Shell><Head><title>Partners | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Partners (Resellers)</h1>
    <div className="bg-surface border border-border rounded-lg p-5 mb-4"><h3 className="text-[16px] font-semibold text-[#2B3450] mb-3">{edit?'Edit':'Add'} Partner</h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <input placeholder="Name *" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} className={iS} />
        <input placeholder="Slug *" value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})} className={iS} />
        <input placeholder="Contact Name" value={form.contact_name||''} onChange={e=>setForm({...form,contact_name:e.target.value})} className={iS} />
        <input placeholder="Contact Email" value={form.contact_email||''} onChange={e=>setForm({...form,contact_email:e.target.value})} className={iS} />
        <input placeholder="Contact Phone" value={form.contact_phone||''} onChange={e=>setForm({...form,contact_phone:e.target.value})} className={iS} />
        <input type="number" placeholder="Commission (bps, optional)" value={form.commission_bps||''} onChange={e=>setForm({...form,commission_bps:Number(e.target.value)})} className={iS} />
      </div>
      <p className="text-[11px] text-outline mb-3">Commission is optional — partners like Alliance negotiate per-client rates and may bill directly.</p>
      <button onClick={save} className="bg-primary text-on-primary px-4 py-2 rounded-md text-[13px] font-semibold cursor-pointer border-none mr-2">{edit?'Update':'Create'}</button>
      {edit && <button onClick={()=>{setForm({});setEdit(null)}} className="bg-surface border border-border px-4 py-2 rounded-md text-[13px] cursor-pointer">Cancel</button>}
    </div>
    <div className="bg-surface border border-border rounded-lg overflow-hidden"><table className="w-full text-[13px] border-collapse"><thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Commission</th><th className="p-3"></th></tr></thead>
    <tbody>{list.map((p:any)=><tr key={p.id} className="border-b border-border"><td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.contact_name||'—'}<br/><span className="text-[11px] text-outline">{p.contact_email||''}{p.contact_phone?' · '+p.contact_phone:''}</span></td><td className="p-3">{p.commission_bps ? (p.commission_bps/100).toFixed(2)+'%' : '—'}</td><td className="p-3"><button onClick={()=>{setForm({name:p.name,slug:p.slug,contact_name:p.contact_name,contact_email:p.contact_email,contact_phone:p.contact_phone,commission_bps:p.commission_bps});setEdit(p.id)}} className="text-primary bg-transparent border border-primary rounded px-2 py-1 text-[11px] cursor-pointer mr-1">Edit</button><button onClick={async()=>{if(confirm('Delete?')){await api.delete('/cowork/v2/setup/resellers/'+p.id);mutate();toast.success('Deleted')}}} className="text-error bg-transparent border border-error rounded px-2 py-1 text-[11px] cursor-pointer">Delete</button></td></tr>)}</tbody></table></div>
  </Shell>);
}
