import { AuthContext } from '@contexts/AuthContext';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { parseCookies } from 'nookies';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { 'user-token': token } = parseCookies(ctx);
  if (!token) return { redirect: { destination: '/login?expired=true', permanent: false } };
  return { props: {} };
};

const NAV_ITEMS = [
  { group: 'DAILY USE', role: 'all', items: [
    { label: 'Dashboard', href: '/operator/dashboard', icon: 'dashboard' },
    { label: 'Clients', href: '/operator/clients', icon: 'people', children: [
      { label: 'All Clients', href: '/operator/clients' },
      { label: 'Add Client', href: '/operator/clients/add' },
    ]},
    { label: 'Contracts', href: '/operator/contracts', icon: 'description', children: [
      { label: 'All Contracts', href: '/operator/contracts' },
      { label: 'New Contract', href: '/operator/contracts/new' },
    ]},
    { label: 'Bookings', href: '/operator/bookings', icon: 'event' },
    { label: 'Billing & Payments', href: '/operator/billing', icon: 'payments', children: [
      { label: 'Invoices', href: '/operator/billing' },
      { label: 'Payments (Mark Paid)', href: '/operator/billing' },
      { label: 'Partner Billing', href: '/operator/billing' },
    ]},
    { label: 'Communication', href: '/operator/communication/messages', icon: 'chat', children: [
      { label: 'Messages', href: '/operator/communication/messages' },
      { label: 'Chat', href: '/operator/communication/chat' },
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

function Sidebar({ user }: { user: any }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string,boolean>>({Clients:true});
  const isAdmin = user?.role === 'ADMIN';

  const toggle = (label: string) => setExpanded(prev => ({...prev, [label]: !prev[label]}));

  return (
    <aside className="flex flex-col bg-[#2B3450] text-white fixed left-0 top-0 bottom-0 overflow-y-auto" style={{width:240,fontFamily:"'Laca','Be Vietnam Pro',sans-serif"}}>
      <div className="px-4 py-5 flex items-center gap-2 border-b border-white/10">
        <img src="/workeaser-logo.svg" alt="Workeaser" className="h-7" />
        <span className="text-[#00A2DD] font-semibold text-base">Workeaser</span>
      </div>
      <nav className="flex-1 py-3">
        {NAV_ITEMS.filter(g => g.role === 'all' || (g.role === 'ADMIN' && isAdmin)).map(group => (
          <div key={group.group}>
            <div className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest opacity-40">{group.group}</div>
            {group.items.map(item => (
              <div key={item.label}>
                <Link href={item.href}
                  onClick={(e) => { if (item.children) { e.preventDefault(); toggle(item.label); } }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-[13px] no-underline transition-all ${
                    router.pathname.startsWith(item.href) ? 'bg-[#00A2DD]/20 text-white border-l-[3px] border-[#00A2DD] font-semibold' : 'text-white/70 border-l-[3px] border-transparent font-normal'
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </Link>
                {item.children && expanded[item.label] && (
                  <div className="ml-9">
                    {item.children.map(child => (
                      <Link key={child.label} href={child.href}
                        className={`block px-3 py-2 text-[12px] no-underline transition-all ${
                          router.pathname === child.href ? 'text-[#00A2DD] font-semibold' : 'text-white/50'
                        }`}>{child.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 text-[11px] opacity-40 text-center">2026 Workeaser</div>
    </aside>
  );
}

export default function DashboardPage() {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-background" style={{fontFamily:"'Laca','Be Vietnam Pro',sans-serif"}}>
      <Sidebar user={user} />
      <div style={{marginLeft:240}} className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-surface border-b border-border flex items-center justify-end px-6">
          <input type="search" placeholder="Search clients, contracts..." className="px-3 py-1.5 border border-outline-variant rounded-md text-[13px] w-60 mr-4 outline-none" />
          <span className="text-[13px] text-on-surface font-medium mr-2">{user?.first_name} {user?.last_name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold uppercase ${user?.role==='ADMIN'?'bg-primary':'bg-success'}`}>{user?.role}</span>
          <button onClick={async () => { await signOut(); router.push('/login'); }} className="ml-2 px-3 py-1 border border-outline-variant rounded text-[12px] text-outline cursor-pointer bg-transparent">Logout</button>
        </header>
        {/* Content */}
        <main className="flex-1 p-6">
          <h1 className="text-[24px] font-bold text-[#2B3450] mb-6">Dashboard</h1>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[{label:'Active Locations',value:'10',color:'#00A2DD'},{label:'Active Members',value:'239',color:'#10B981'},{label:'Receivable Income',value:'$800.00',color:'#2B3450'},{label:'Pending Items',value:'0',color:'#F59E0B'}].map(kpi=>(
              <div key={kpi.label} className="bg-surface border border-border rounded-lg p-5">
                <div className="text-[28px] font-bold" style={{color:kpi.color}}>{kpi.value}</div>
                <div className="text-[13px] text-on-surface-variant mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['Total Occupancy','Sales Pipeline Funnel','Clients per Product Category','Invoices per Status'].map(title=>(
              <div key={title} className="bg-surface border border-border rounded-lg p-5">
                <h3 className="text-[13px] font-semibold text-[#2B3450] mb-3">{title}</h3>
                <div className="text-[13px] text-on-surface-variant text-center py-8">Data available in dashboard API</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
