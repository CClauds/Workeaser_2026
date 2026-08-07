/**
 * B3: Operator header — user info, search, notifications.
 */
import { AuthContext } from '@contexts/AuthContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';

export default function OperatorHeader() {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header
      style={{
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Search (placeholder — B3-D) */}
      <input
        type="search"
        placeholder="Search clients, contracts..."
        style={{
          padding: '6px 12px',
          border: '1px solid #cbd5e1',
          borderRadius: 6,
          fontSize: 13,
          width: 240,
          marginRight: 16,
          outline: 'none',
        }}
      />

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <span style={{ color: '#2B3450', fontWeight: 500 }}>
          {user?.first_name} {user?.last_name}
        </span>
        <span style={{
          fontSize: 10,
          background: user?.role === 'ADMIN' ? '#00A2DD' : '#10B981',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 10,
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
