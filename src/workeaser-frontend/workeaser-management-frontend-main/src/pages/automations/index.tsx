/**
 * HF-SPRINT-L-04 — Adoção de EmptyArrayResponse.
 *
 * Antes: pagina era literalmente <div></div> vazia. Quem clicasse em "Automations"
 *   no menu via nada e nao sabia se era bug ou feature nao implementada.
 * Agora: empty state em PT-BR com CTA pra contato (sinaliza que feature ta no roadmap).
 */
import React, { ReactElement } from "react";
import Head from "next/head";
import { CoworkingLayout } from "@components/Layouts/CoworkingLayout";
import { EmptyArrayResponse } from "@components/EmptyArrayResponse";
import { PageHeader } from "@components/Headers/PageHeader";

function Automations() {
  return (
    <>
      <Head>
        <title>Automações | Workeaser</title>
      </Head>

      <PageHeader>
        <div>
          <h1>Automações</h1>
          <h2>Em desenvolvimento</h2>
        </div>
      </PageHeader>

      <EmptyArrayResponse
        item="automations"
        icon="🤖"
        title="Automações chegando em breve"
        description="Aqui vão ficar disparos automáticos: 'cliente atrasou 3 dias → manda WhatsApp', 'contrato vence em 30 dias → cria renovação'. Quer participar do beta? Manda email pra contato@workeaser.com"
        ctaLabel="Falar com Rogerio →"
        ctaHref="/contact"
      />
    </>
  );
}

Automations.getLayout = function getLayout(page: ReactElement) {
  return <CoworkingLayout>{page}</CoworkingLayout>;
};

export default Automations;
