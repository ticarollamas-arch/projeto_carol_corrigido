import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-16 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-emerald-400 mb-8">Política de Privacidade</h1>
      <p className="mb-4">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      
      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">1. Coleta de Dados</h2>
      <p className="mb-4">Nós coletamos informações para fornecer melhores serviços. Os dados coletados incluem logs de acesso (IP, navegador, horário), arquivos enviados voluntariamente para análise e e-mail de contato.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">2. Uso dos Dados</h2>
      <p className="mb-4">Os arquivos enviados são processados de forma isolada (sandbox) e temporária, sendo deletados após a análise. Não compartilhamos seus arquivos ou código com terceiros.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">3. Seus Direitos (LGPD)</h2>
      <p className="mb-4">De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a acessar, corrigir ou excluir seus dados a qualquer momento.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">4. Contato</h2>
      <p className="mb-4">Para exercer seus direitos, entre em contato pelo e-mail: privacidade@osachadinhosdashopee.com.br</p>

      <a href="/" className="inline-block mt-8 text-emerald-400 hover:underline">&larr; Voltar para a página inicial</a>
    </div>
  );
}
