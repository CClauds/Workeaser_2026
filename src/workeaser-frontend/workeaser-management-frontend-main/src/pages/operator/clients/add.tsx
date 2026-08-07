/**
 * B3-B: Add Client — creates client_account + N service_contracts.
 * Each service row has: service_type, room (nullable), billing_channel, reseller, dates.
 */
import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { getAPIClient } from '@services/apiClient';
import { api } from '@services/api';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useState } from 'react';
import { toast } from 'react-toastify';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function AddClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '', company_email: '', company_phone: '',
    contact_first_name: '', contact_last_name: '', contact_email: '', contact_phone: '',
    pmb_number: '', address: '', ein: '', notes: '',
  });
  const [contracts, setContracts] = useState<any[]>([{
    service_type_id: '', rooms_unit_id: '', price_cents: 0,
    billing_channel: 'DIRECT', reseller_id: '', started_at: new Date().toISOString().slice(0, 10),
  }]);

  const { data: svcTypes } = useFetch<any>('/cowork/v2/service-types');
  const { data: rooms } = useFetch<any>('/cowork/v2/rooms');
  const { data: resellers } = useFetch<any>('/cowork/v2/resellers');

  const serviceTypes = svcTypes?.data ?? svcTypes?.result ?? [];
  const roomsList = rooms?.data ?? rooms?.result ?? [];
  const resellersList = resellers?.data ?? resellers?.result ?? [];

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleContractChange = (idx: number, field: string, value: any) => {
    const updated = [...contracts];
    updated[idx] = { ...updated[idx], [field]: value };
    setContracts(updated);
  };

  const addContractRow = () => setContracts([...contracts, {
    service_type_id: '', rooms_unit_id: '', price_cents: 0,
    billing_channel: 'DIRECT', reseller_id: '', started_at: new Date().toISOString().slice(0, 10),
  }]);

  const removeContractRow = (idx: number) => {
    if (contracts.length === 1) return;
    setContracts(contracts.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/cowork/v2/clients', { ...form, contracts });
      toast.success('Client created');
      router.push('/operator/clients');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create client');
      setSaving(false);
    }
  };

  const formStyle: any = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 13, width: '100%' };
  const selectStyle: any = { ...formStyle, background: '#fff' };
  const labelStyle: any = { fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' };
  const sectionStyle: any = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  return (
    <OperatorLayout>
      <Head><title>Add Client | Workeaser</title></Head>
      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif", maxWidth: 900 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', marginBottom: 24 }}>Add Client</h1>

        <form onSubmit={handleSubmit}>
          {/* Client Info */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2B3450', marginBottom: 16 }}>Client Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['company_name', 'contact_first_name', 'contact_last_name', 'company_email', 'contact_email', 'company_phone', 'contact_phone', 'pmb_number'].map((f) => (
                <div key={f}>
                  <label style={labelStyle}>{f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                  <input name={f} value={(form as any)[f]} onChange={handleChange} style={formStyle} />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Address (US format: street, city, state, ZIP)</label>
                <input name="address" value={form.address} onChange={handleChange} style={formStyle} placeholder="123 Main St, Orlando, FL 32801" />
              </div>
              <div>
                <label style={labelStyle}>EIN (Tax ID)</label>
                <input name="ein" value={form.ein} onChange={handleChange} style={formStyle} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Notes / Observations</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...formStyle, minHeight: 60 }} />
              </div>
            </div>
          </div>

          {/* Service Contracts */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2B3450', margin: 0 }}>Service Contracts</h3>
              <button type="button" onClick={addContractRow} style={{ background: '#00A2DD', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>+ Add Service</button>
            </div>
            {contracts.map((c, idx) => (
              <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: 12, marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                <div><label style={labelStyle}>Service Type *</label>
                  <select value={c.service_type_id} onChange={(e) => handleContractChange(idx, 'service_type_id', e.target.value)} style={selectStyle}>
                    <option value="">Select...</option>
                    {serviceTypes.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div><label style={labelStyle}>Room</label>
                  <select value={c.rooms_unit_id} onChange={(e) => handleContractChange(idx, 'rooms_unit_id', e.target.value)} style={selectStyle}>
                    <option value="">None (virtual service)</option>
                    {roomsList.map((r: any) => <option key={r.id} value={r.id}>{r.display_name} ({r.room_number})</option>)}
                  </select></div>
                <div><label style={labelStyle}>Price (cents)</label>
                  <input type="number" value={c.price_cents} onChange={(e) => handleContractChange(idx, 'price_cents', Number(e.target.value))} style={formStyle} /></div>
                <div><label style={labelStyle}>Start Date</label>
                  <input type="date" value={c.started_at} onChange={(e) => handleContractChange(idx, 'started_at', e.target.value)} style={formStyle} /></div>
                <div><label style={labelStyle}>Billing Channel</label>
                  <select value={c.billing_channel} onChange={(e) => handleContractChange(idx, 'billing_channel', e.target.value)} style={selectStyle}>
                    <option value="DIRECT">Direct (EWS→Client)</option>
                    <option value="RESELLER">Reseller (EWS→Reseller→Client)</option>
                  </select></div>
                {c.billing_channel === 'RESELLER' && (
                  <div><label style={labelStyle}>Reseller</label>
                    <select value={c.reseller_id} onChange={(e) => handleContractChange(idx, 'reseller_id', e.target.value)} style={selectStyle}>
                      <option value="">Select...</option>
                      {resellersList.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select></div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="button" onClick={() => removeContractRow(idx)}
                    style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving}
              style={{ background: '#00A2DD', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save Client'}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </OperatorLayout>
  );
}
