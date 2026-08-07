import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import { Shell } from '@components/OperatorShell/Shell';
import { useFetch } from 'hooks/useFetch';
import { useRouter } from 'next/router';
import { useState } from 'react';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

function ClientModal({ client, onClose }: { client?: any; onClose: () => void }) {
  if (!client) return null;
  const contracts = client.serviceContracts || [];
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-[18px] font-semibold text-[#2B3450]">{client.contact_first_name} {client.contact_last_name}</h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface text-[24px] leading-none">&times;</button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 text-[13px] mb-6">
            {[{l:'Company',v:client.company_name},{l:'Email',v:client.company_email||client.contact_email},{l:'Phone',v:client.company_phone||client.contact_phone},{l:'PMB',v:client.pmb_number},{l:'EIN',v:client.ein},{l:'Address',v:client.address},{l:'Notes',v:client.notes}].map(r=>(
              <div key={r.l}><span className="text-outline">{r.l}:</span> <span className="text-on-surface">{r.v||'—'}</span></div>
            ))}
          </div>
          <h3 className="text-[14px] font-semibold text-[#2B3450] mb-3">Service Contracts ({contracts.length})</h3>
          <table className="w-full text-[13px] border-collapse">
            <thead><tr className="text-left border-b-2 border-border text-[11px] text-outline uppercase"><th className="p-2">Service</th><th className="p-2">Room</th><th className="p-2">Price</th><th className="p-2">Channel</th><th className="p-2">Status</th></tr></thead>
            <tbody>{contracts.map((sc:any)=>(<tr key={sc.id} className="border-b border-border">
              <td className="p-2 font-medium">{sc.serviceType?.name||'—'}</td><td className="p-2">{sc.roomsUnit?.display_name||'—'}</td>
              <td className="p-2">${((sc.price_cents||0)/100).toFixed(2)}</td>
              <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.billing_channel==='DIRECT'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-800'}`}>{sc.billing_channel}</span></td>
              <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{sc.status}</span></td>
            </tr>))}</tbody>
          </table>
          {contracts.length===0 && <p className="text-outline text-center py-6">No active services.</p>}
        </div>
      </div>
    </div>
  );
}

export default function AllClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const { data } = useFetch<any>('/cowork/v2/clients?perPage=100'+(search?`&search=${search}`:''));
  const clients = (data?.data ?? data?.result ?? []) as any[];

  return (<Shell><Head><title>All Clients | Workeaser</title></Head>
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-[24px] font-bold text-[#2B3450]">All Clients</h1>
      <button onClick={()=>router.push('/operator/clients/add')} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg text-[14px] font-semibold cursor-pointer border-none">+ Add Client</button>
    </div>
    <input type="search" placeholder="Search by company, name, phone..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full px-3.5 py-2.5 border border-outline-variant rounded-lg text-[14px] mb-4 outline-none" />
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <table className="w-full text-[13px] border-collapse">
        <thead><tr className="bg-[#2B3450] text-white text-left text-[11px] uppercase"><th className="p-3">Client</th><th className="p-3">Company</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Services</th><th className="p-3">Room</th><th className="p-3">Status</th></tr></thead>
        <tbody>{clients.map((c:any)=>{const sc=c.serviceContracts||[];const f=sc[0];return(<tr key={c.id} onClick={()=>setSelected(c)} className="border-b border-border cursor-pointer hover:bg-surface-container-low">
          <td className="p-3 font-medium">{c.contact_first_name} {c.contact_last_name}</td><td className="p-3">{c.company_name||'—'}</td><td className="p-3">{c.company_email||c.contact_email||'—'}</td><td className="p-3">{c.company_phone||c.contact_phone||'—'}</td>
          <td className="p-3">{sc.map((s:any)=>s.serviceType?.name).filter(Boolean).join(', ')||'—'}</td><td className="p-3">{f?.roomsUnit?.display_name||'—'}</td>
          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${f?.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-amber-100 text-amber-800'}`}>{f?.status||'No services'}</span></td>
        </tr>)})}</tbody>
      </table>
      {clients.length===0 && <p className="text-outline text-center py-10">No clients found.</p>}
    </div>
    {selected && <ClientModal client={selected} onClose={()=>setSelected(null)} />}
  </Shell>);
}
