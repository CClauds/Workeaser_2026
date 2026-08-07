/**
 * B3: Operator sidebar — canonical navigation from §7.
 * Role-gated: SETUP group visible only to Administrator.
 * Brand: Workeaser colors (#00A2DD primary, #2B3450 navy).
 */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '@contexts/AuthContext';
import { useContext } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const DAILY_USE: NavItem[] = [
  { label: 'Dashboard', href: '/operator/dashboard', icon: 'dashboard' },
  { label: 'Clients', href: '/operator/clients', icon: 'people' },
  { label: 'Contracts', href: '/operator/contracts', icon: 'description' },
  { label: 'Bookings', href: '/operator/bookings', icon: 'event' },
  { label: 'Billing & Payments', href: '/operator/billing', icon: 'payments' },
  { label: 'Communication', href: '/operator/communication', icon: 'chat' },
  { label: 'Documents', href: '/operator/documents', icon: 'folder' },
  { label: 'Reports', href: '/operator/reports', icon: 'bar_chart' },
];

const SETUP: NavItem[] = [
  { label: 'Partners', href: '/operator/setup/partners', icon: 'handshake' },
  { label: 'Locations, Rooms & Services', href: '/operator/setup/rooms-services', icon: 'business' },
  { label: 'Contract Templates', href: '/operator/setup/contract-templates', icon: 'contract' },
  { label: 'Invoice Settings', href: '/operator/setup/invoice-settings', icon: 'settings' },
  { label: 'Payment Methods', href: '/operator/setup/payment-methods', icon: 'credit_card' },
  { label: 'Visual Identity', href: '/operator/setup/visual-identity', icon: 'palette' },
  { label: 'Users & Roles', href: '/operator/setup/users-roles', icon: 'admin_panel_settings' },
];

export default function OperatorSidebar() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const isActive = (href: string) => router.pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 240,
        background: '#2B3450',
        color: '#fff',
        minHeight: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        fontFamily: "'Laca', 'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img
          src="/workeaser-logo.svg"
          alt="Workeaser"
          style={{ height: 28 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span style={{ marginLeft: 8, fontWeight: 600, fontSize: 16, color: '#00A2DD' }}>
          Workeaser
        </span>
      </div>

      {/* Daily Use */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        <SectionLabel text="Daily Use" />
        {DAILY_USE.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item.href)}
          />
        ))}

        {/* Setup (Administrator only) */}
        {isAdmin && (
          <>
            <SectionLabel text="Setup" />
            {SETUP.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, opacity: 0.5 }}>
        © 2026 Workeaser
      </div>
    </aside>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      padding: '16px 16px 4px',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      opacity: 0.45,
    }}>
      {text}
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
        background: active ? 'rgba(0,162,221,0.2)' : 'transparent',
        borderLeft: active ? '3px solid #00A2DD' : '3px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
