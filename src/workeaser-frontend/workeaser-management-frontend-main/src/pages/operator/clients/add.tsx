import { GetServerSideProps } from 'next'; import Head from 'next/head'; import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell'; import { useFetch } from 'hooks/useFetch'; import { api } from '@services/api'; import { useRouter } from 'next/router'; import { useState } from 'react'; import { toast } from 'react-toastify';
export const getServerSideProps: GetServerSideProps = async (ctx) => { const { 'user-token': token } = parseCookies(ctx); if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } }; return { props: {} }; };
export default function AddClientPage() {
  const router=useRouter(); const [saving,setSaving]=useState(false);
  const [form,setForm]=useState<any>({company_name:'',company_email:'',company_phone:'',contact_first_name:'',contact_last_name:'',contact_email:'',contact_phone:'',pmb_number:'',address:'',ein:'',notes:''});
  const [contracts,setContracts]=useState<any[]>([{service_type_id:'',rooms_unit_id:'',price_cents:0,billing_channel:'DIRECT',reseller_id:'',started_at:new Date().toISOString().slice(0,10)}]);
  const {data:svc}=useFetch<any>('/cowork/v2/setup/service-types'); const {data:rooms}=useFetch<any>('/cowork/v2/setup/rooms'); const {data:res}=useFetch<any>('/cowork/v2/setup/resellers');
  const svcTypes=svc??[]; const roomsList=rooms??[]; const resellers=res??[];
  const addRow=()=>setContracts([...contracts,{service_type_id:'',rooms_unit_id:'',price_cents:0,billing_channel:'DIRECT',reseller_id:'',started_at:new Date().toISOString().slice(0,10)}]);
  const rmRow=(i:number)=>{if(contracts.length===1)return;setContracts(contracts.filter((_,j)=>j!==i))};
  const updContract=(i:number,f:string,v:any)=>{const c=[...contracts];c[i]={...c[i],[f]:v};setContracts(c)};
  const submit=async(e:any)=>{e.preventDefault();setSaving(true);try{await api.post('/cowork/v2/clients',{...form,contracts});toast.success('Client created');router.push('/operator/clients')}catch(err:any){toast.error(err?.response?.data?.message||'Failed')}finally{setSaving(false)}};
  const iStyle="px-3 py-2 border border-outline-variant rounded-md text-[13px] outline-none w-full";
  return (<Shell><Head><title>Add Client | Workeaser</title></Head>
    <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Add Client</h1>
    <form onSubmit={submit} className="max-w-3xl">
      <div className="bg-surface border border-border rounded-lg p-5 mb-4"><h3 className="text-[16px] font-semibold text-[#2B3450] mb-3">Client Information</h3>
        <div className="grid grid-cols-2 gap-3">{['company_name','contact_first_name','contact_last_name','company_email','contact_email','company_phone','contact_phone','pmb_number'].map(f=><input key={f} name={f} placeholder={f.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} value={form[f]||''} onChange={e=>setForm({...form,[f]:e.target.value})} className={iStyle} />)}
        <input placeholder="Address (US format)" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} className={iStyle} />
        <input placeholder="EIN (Tax ID)" value={form.ein||''} onChange={e=>setForm({...form,ein:e.target.value})} className={iStyle} />
        </div>
        <textarea placeholder="Notes / Observations" value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} className={`${iStyle} mt-3 min-h-[60px]`} />
      </div>
      <div className="bg-surface border border-border rounded-lg p-5 mb-4"><div className="flex justify-between items-center mb-3"><h3 className="text-[16px] font-semibold text-[#2B3450]">Service Contracts</h3><button type="button" onClick={addRow} className="bg-primary text-on-primary px-3 py-1.5 rounded text-[13px] font-semibold cursor-pointer border-none">+ Add Service</button></div>
      {contracts.map((c,i)=><div key={i} className="border border-border rounded-md p-3 mb-2 grid grid-cols-4 gap-2">
        <select value={c.service_type_id} onChange={e=>updContract(i,'service_type_id',e.target.value)} className={iStyle}><option value="">Service Type *</option>{svcTypes.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={c.rooms_unit_id} onChange={e=>updContract(i,'rooms_unit_id',e.target.value)} className={iStyle}><option value="">Room (optional)</option>{roomsList.map((r:any)=><option key={r.id} value={r.id}>{r.display_name}</option>)}</select>
        <input type="number" placeholder="Price (cents)" value={c.price_cents||''} onChange={e=>updContract(i,'price_cents',Number(e.target.value))} className={iStyle} />
        <select value={c.billing_channel} onChange={e=>updContract(i,'billing_channel',e.target.value)} className={iStyle}><option value="DIRECT">Direct</option><option value="RESELLER">Reseller</option></select>
        {c.billing_channel==='RESELLER'&&<select value={c.reseller_id} onChange={e=>updContract(i,'reseller_id',e.target.value)} className={iStyle}><option value="">Reseller *</option>{resellers.map((r:any)=><option key={r.id} value={r.id}>{r.name}</option>)}</select>}
        <input type="date" value={c.started_at||''} onChange={e=>updContract(i,'started_at',e.target.value)} className={iStyle} />
        <button type="button" onClick={()=>rmRow(i)} className="text-error bg-transparent border border-error rounded px-2 py-1 text-[11px] cursor-pointer">Remove</button>
      </div>)}
      </div>
      <div className="flex gap-3"><button type="submit" disabled={saving} className="bg-primary text-on-primary px-6 py-2.5 rounded-md text-[14px] font-semibold cursor-pointer border-none disabled:opacity-50">{saving?'Saving...':'Save Client'}</button><button type="button" onClick={()=>router.back()} className="bg-surface border border-border px-6 py-2.5 rounded-md text-[14px] cursor-pointer">Cancel</button></div>
    </form>
  </Shell>);
}
