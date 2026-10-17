import React from 'react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-16 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-emerald-400 mb-8">Termos de Uso</h1>
      
      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">1. Aceitação</h2>
      <p className="mb-4">Ao acessar e usar esta ferramenta de Engenharia Reversa, você concorda com estes termos.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">2. Uso Permitido</h2>
      <p className="mb-4">A ferramenta deve ser usada estritamente para fins de auditoria, segurança, aprendizado (Clean Room) e análise de softwares que você possui ou tem autorização legal para inspecionar. É proibido o uso para violar direitos autorais ou acessar sistemas de terceiros ilegalmente.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">3. Limitação de Responsabilidade</h2>
      <p className="mb-4">O serviço é fornecido "como está". Não nos responsabilizamos pelo uso indevido das informações extraídas.</p>

      <a href="/" className="inline-block mt-8 text-emerald-400 hover:underline">&larr; Voltar para a página inicial</a>
    </div>
  );
}
