import { GetServerSideProps } from "next";

/**
 * HF-AUDIT-02: a auditoria externa flaggou "Tela Relationship permanece em branco".
 *
 * Causa raiz: não existia `relationship/index.tsx`. O menu lateral linkava para
 * `/relationship` (sem subpágina), Next.js renderizava 404/tela vazia.
 *
 * Fix: redirect server-side para `/relationship/dashboard` (subpágina padrão).
 * Usuário que veio do menu ou de bookmark antigo é levado pra dashboard automaticamente.
 *
 * Subpáginas existentes: agenda, client-management, dashboard, deals-and-opportunities,
 * lead-management, omnichat.
 */
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/relationship/dashboard",
      permanent: false, // 302 (temporary) — facilita ajuste futuro
    },
  };
};

const RelationshipIndex = () => null;
export default RelationshipIndex;
