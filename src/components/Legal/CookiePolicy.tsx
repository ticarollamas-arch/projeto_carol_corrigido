import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-16 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-emerald-400 mb-8">Política de Cookies</h1>
      
      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">1. O que são Cookies?</h2>
      <p className="mb-4">Cookies são pequenos arquivos de texto armazenados no seu dispositivo que ajudam o site a lembrar de suas preferências e melhorar sua experiência.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">2. Como usamos Cookies</h2>
      <p className="mb-4">Utilizamos cookies essenciais para o funcionamento do sistema de análise e cookies de terceiros (como Google AdSense) para exibir anúncios relevantes e medir o tráfego.</p>

      <h2 className="text-xl font-bold text-slate-100 mt-8 mb-4">3. Como desativar</h2>
      <p className="mb-4">Você pode desativar os cookies nas configurações do seu navegador. No entanto, isso pode afetar o funcionamento de algumas áreas do site.</p>

      <a href="/" className="inline-block mt-8 text-emerald-400 hover:underline">&larr; Voltar para a página inicial</a>
    </div>
  );
}
