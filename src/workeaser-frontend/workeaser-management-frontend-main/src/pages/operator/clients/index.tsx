/**
 * B3-B: All Clients — list from client_accounts JOIN service_contracts (B2 tables).
 * Filters: company, name, room, service. Global search.
 * Cableado: CRUD completo vía /api/cowork/v2/clients.
 */
import OperatorLayout from '@components/OperatorShell/OperatorLayout';
import { getAPIClient } from '@services/apiClient';
import { useFetch } from 'hooks/useFetch';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { useState } from 'react';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

export default function AllClientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, isValidating, mutate } = useFetch<any>(
    `/cowork/v2/clients?page=${page}&perPage=25${search ? `&search=${search}` : ''}`
  );

  const clients = data?.data ?? data?.result ?? [];
  const pagination = data?.meta ?? data?.pagination ?? {};

  return (
    <OperatorLayout>
      <Head><title>All Clients | Workeaser</title></Head>

      <div style={{ fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2B3450', margin: 0 }}>All Clients</h1>
          <Link href="/operator/clients/add" style={{
            background: '#00A2DD', color: '#fff', padding: '10px 20px', borderRadius: 6,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}>
            + Add Client
          </Link>
        </div>

        {/* Search */}
        <input
          type="search" placeholder="Search by company, name, phone..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, marginBottom: 16, fontSize: 14, outline: 'none' }}
        />

        {/* Loading/Error/Empty */}
        {isValidating && !clients.length && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading clients...</div>
        )}
        {error && !clients.length && (
          <div style={{ textAlign: 'center', padding: 40, color: '#b91c1c' }}>Failed to load clients. Server may be unavailable.</div>
        )}
        {!isValidating && !error && !clients.length && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No clients found.</div>
        )}

        {/* Table */}
        {clients.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                <th style={th}>Client</th><th style={th}>Company</th><th style={th}>Email</th><th style={th}>Phone</th>
                <th style={th}>Services</th><th style={th}>Room</th><th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => {
                const contracts = c.serviceContracts ?? [];
                const firstContract = contracts[0];
                return (
                  <tr key={c.id} onClick={() => router.push(`/operator/clients/${c.id}`)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid #e2e8f0', fontSize: 13, color: '#2B3450' }}>
                    <td style={td}>
                      <strong>{c.contact_first_name} {c.contact_last_name}</strong>
                    </td>
                    <td style={td}>{c.company_name ?? '—'}</td>
                    <td style={td}>{c.company_email ?? c.contact_email ?? '—'}</td>
                    <td style={td}>{c.company_phone ?? c.contact_phone ?? '—'}</td>
                    <td style={td}>
                      {contracts.length > 0
                        ? contracts.map((sc: any) => sc.serviceType?.name).filter(Boolean).join(', ')
                        : '—'}
                    </td>
                    <td style={td}>{firstContract?.roomsUnit?.display_name ?? '—'}</td>
                    <td style={td}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11,
                        background: firstContract?.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                        color: firstContract?.status === 'ACTIVE' ? '#166534' : '#92400e',
                      }}>
                        {firstContract?.status ?? 'No services'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination?.lastPage > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
            {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 4,
                  background: p === page ? '#00A2DD' : '#fff', color: p === page ? '#fff' : '#2B3450',
                  cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </OperatorLayout>
  );
}

const th: any = { padding: '10px 14px', borderBottom: '2px solid #e2e8f0' };
const td: any = { padding: '10px 14px' };
