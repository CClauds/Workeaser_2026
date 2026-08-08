/**
 * B3-B: Client Detail — shows client info + all service_contracts with billing_channel per contract.
 * Quick Access: Documents, Invoices, Messages, Chat. Pending items band.
 */
import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { getAPIClient } from '@services/apiClient';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error, isValidating } = useFetch<any>(id ? `/cowork/v2/clients/${id}` : null);
  const client = data?.data ?? data?.result ?? data;
  const contracts = client?.serviceContracts ?? [];

  const sectionStyle: any = { background: '#fff', padding: 20, borderRadius: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

  if (isValidating) return <OperatorLayout><div style={{ padding: 40, textAlign: 'center' }}>Loading client...</div></OperatorLayout>;
  if (error) return <OperatorLayout><div style={{ padding: 40, textAlign: 'center', color: '#b91c1c' }}>Failed to load client.</div></OperatorLayout>;
  if (!client) return <OperatorLayout><div style={{ padding: 40, textAlign: 'center' }}>Client not found.</div></OperatorLayout>;

  return (
    <OperatorLayout>
      <Head><title>{client.company_name || 'Client'} | Workeaser</title></Head>
      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif", maxWidth: 960 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Link href="/operator/clients" style={{ fontSize: 13, color: '#00A2DD', textDecoration: 'none' }}>← All Clients</Link>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', margin: '4px 0 0' }}>
              {client.contact_first_name} {client.contact_last_name}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{client.company_name}{client.ein ? ` · EIN: ${client.ein}` : ''}</p>
          </div>
          <Link href={`/operator/clients/${id}/edit`}
            style={{ background: '#00A2DD', color: '#fff', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Edit Client
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Client Info */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2B3450', marginTop: 0 }}>Contact Information</h3>
            <InfoRow label="Email" value={client.company_email || client.contact_email} />
            <InfoRow label="Phone" value={client.company_phone || client.contact_phone} />
            <InfoRow label="PMB" value={client.pmb_number} />
            <InfoRow label="Address" value={client.address} />
            <InfoRow label="EIN" value={client.ein} />
            <InfoRow label="Notes" value={client.notes} />
          </div>

          {/* Quick Access */}
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2B3450', marginTop: 0 }}>Quick Access</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['Documents', 'Invoices', 'Messages', 'Chat'].map((label) => (
                <div key={label} style={{ padding: '10px 14px', background: '#f1f5f9', borderRadius: 6, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                  {label}
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Pending</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Contracts */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2B3450', marginTop: 0, marginBottom: 12 }}>Service Contracts ({contracts.length})</h3>
          {contracts.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No active services.</p>
          ) : (
            <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px' }}>Service</th>
                  <th style={{ padding: '8px 10px' }}>Room</th>
                  <th style={{ padding: '8px 10px' }}>Price</th>
                  <th style={{ padding: '8px 10px' }}>Billing Channel</th>
                  <th style={{ padding: '8px 10px' }}>Reseller</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((sc: any) => (
                  <tr key={sc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 500 }}>{sc.serviceType?.name ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>{sc.roomsUnit?.display_name ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>${((sc.price_cents ?? 0) / 100).toFixed(2)}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11,
                        background: sc.billing_channel === 'DIRECT' ? '#dbeafe' : '#fef3c7',
                        color: sc.billing_channel === 'DIRECT' ? '#1e40af' : '#92400e' }}>
                        {sc.billing_channel}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>{sc.reseller?.name ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11,
                        background: sc.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                        color: sc.status === 'ACTIVE' ? '#166534' : '#92400e' }}>
                        {sc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </OperatorLayout>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ marginBottom: 6, fontSize: 13 }}>
      <span style={{ color: '#94a3b8', marginRight: 8 }}>{label}:</span>
      <span style={{ color: '#2B3450' }}>{value || '—'}</span>
    </div>
  );
}
