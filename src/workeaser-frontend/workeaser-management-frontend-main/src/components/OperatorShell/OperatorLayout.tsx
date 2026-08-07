/**
 * B3: Operator shell layout — sidebar (fixed, 240px) + main content.
 * Fixes the layout bug from design references (content under sidebar).
 * Brand: Workeaser primary #00A2DD, navy #2B3450. Font: Laca with fallback.
 */
import { ReactNode } from 'react';
import OperatorSidebar from './Sidebar';
import OperatorHeader from './Header';

interface OperatorLayoutProps {
  children: ReactNode;
}

export default function OperatorLayout({ children }: OperatorLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      <OperatorSidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <OperatorHeader />
        <main style={{ flex: 1, padding: '24px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
