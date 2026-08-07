import { AuthContext } from '@contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState, ReactNode } from 'react';

const NAV_ITEMS = [
  { group: 'DAILY USE', role: 'all', items: [
    { label: 'Dashboard', href: '/operator/dashboard', icon: 'dashboard' },
    { label: 'Clients', href: '/operator/clients', icon: 'people', children: [
      { label: 'All Clients', href: '/operator/clients' }, { label: 'Add Client', href: '/operator/clients/add' },
    ]},
    { label: 'Contracts', href: '/operator/contracts', icon: 'description', children: [
      { label: 'All Contracts', href: '/operator/contracts' }, { label: 'New Contract', href: '/operator/contracts/new' },
    ]},
    { label: 'Bookings', href: '/operator/bookings', icon: 'event' },
    { label: 'Billing & Payments', href: '/operator/billing', icon: 'payments', children: [
      { label: 'Invoices', href: '/operator/billing' }, { label: 'Payments', href: '/operator/billing' }, { label: 'Partner Billing', href: '/operator/billing' },
    ]},
    { label: 'Communication', href: '/operator/communication/messages', icon: 'chat', children: [
      { label: 'Messages', href: '/operator/communication/messages' }, { label: 'Chat', href: '/operator/communication/chat' },
    ]},
    { label: 'Documents', href: '/operator/documents', icon: 'folder' },
    { label: 'Reports', href: '/operator/reports', icon: 'bar_chart' },
  ]},
  { group: 'SETUP', role: 'ADMIN', items: [
    { label: 'Partners', href: '/operator/setup/partners', icon: 'handshake' },
    { label: 'Locations, Rooms & Services', href: '/operator/setup/rooms-services', icon: 'business' },
    { label: 'Contract Templates', href: '/operator/setup/contract-templates', icon: 'contract' },
    { label: 'Invoice Settings', href: '/operator/setup/invoice-settings', icon: 'settings' },
    { label: 'Payment Methods', href: '/operator/setup/payment-methods', icon: 'credit_card' },
    { label: 'Visual Identity', href: '/operator/setup/visual-identity', icon: 'palette' },
    { label: 'Users & Roles', href: '/operator/setup/users-roles', icon: 'admin_panel_settings' },
  ]},
];

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string,boolean>>({Clients:true});
  const isAdmin = user?.role === 'ADMIN';
  const toggle = (l: string) => setExpanded(p => ({...p, [l]: !p[l]}));

  return (
    <div className="flex min-h-screen bg-background" style={{fontFamily:"'Laca','Be Vietnam Pro',sans-serif"}}>
      {/* Sidebar */}
      <aside className="flex flex-col bg-[#2B3450] text-white fixed left-0 top-0 bottom-0 overflow-y-auto z-30" style={{width:240}}>
        <div className="px-4 py-5 flex items-center gap-2 border-b border-white/10">
          <img src="/workeaser-logo.svg" alt="Workeaser" className="h-7" />
          <span className="text-[#00A2DD] font-semibold text-base">Workeaser</span>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.filter(g => g.role==='all'||(g.role==='ADMIN'&&isAdmin)).map(group => (
            <div key={group.group}>
              <div className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">{group.group}</div>
              {group.items.map(item => (
                <div key={item.label}>
                  <Link href={item.href} onClick={e=>{if(item.children){e.preventDefault();toggle(item.label)}}}
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] no-underline transition-all ${router.pathname.startsWith(item.href)?'bg-[#00A2DD]/20 text-white border-l-[3px] border-[#00A2DD] font-semibold':'text-white/70 border-l-[3px] border-transparent font-normal'}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>{item.label}
                  </Link>
                  {item.children && expanded[item.label] && (
                    <div className="ml-9">{item.children.map(c=>(
                      <Link key={c.label} href={c.href} className={`block px-3 py-2 text-[12px] no-underline transition-all ${router.pathname===c.href?'text-[#00A2DD] font-semibold':'text-white/50'}`}>{c.label}</Link>
                    ))}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 text-[11px] opacity-40 text-center">2026 Workeaser</div>
      </aside>

      {/* Main */}
      <div style={{marginLeft:240}} className="flex-1 flex flex-col">
        <header className="h-14 bg-surface border-b border-border flex items-center justify-end px-6">
          <input type="search" placeholder="Search clients, contracts..." className="px-3 py-1.5 border border-outline-variant rounded-md text-[13px] w-60 mr-4 outline-none" />
          <span className="text-[13px] text-on-surface font-medium mr-2">{user?.first_name} {user?.last_name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold uppercase ${user?.role==='ADMIN'?'bg-primary':'bg-success'}`}>{user?.role}</span>
          <button onClick={async()=>{await signOut();router.push('/login')}} className="ml-2 px-3 py-1 border border-outline-variant rounded text-[12px] text-outline cursor-pointer bg-transparent">Logout</button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
