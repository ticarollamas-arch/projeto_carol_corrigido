import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      <header className="border-b border-slate-800 p-4 md:p-6 flex flex-wrap justify-between items-center bg-slate-900/50">
        <h1 className="text-xl md:text-2xl font-bold text-emerald-400">Engenharia Reversa</h1>
        <nav className="mt-4 md:mt-0 flex gap-4">
          <a href="#features" className="hover:text-emerald-400 transition">Recursos</a>
          <a href="/app" className="bg-emerald-500 text-slate-950 px-4 py-2 rounded font-semibold hover:bg-emerald-400 transition">Testar Grátis</a>
        </nav>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 py-12 md:py-24 w-full">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Desconstrua qualquer software.<br />
            <span className="text-emerald-400">Entenda a lógica. Recrie com sua identidade.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-8">
            Nossa engine analisa APKs, ZIPs e binários para extrair arquitetura, dependências e regras de negócio. Perfeito para auditoria, aprendizado e Clean Room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/app" className="bg-emerald-500 text-slate-950 px-8 py-3 rounded-lg font-bold text-lg hover:bg-emerald-400 transition">
              Acessar a Ferramenta
            </a>
          </div>
        </div>

        <section id="features" className="grid md:grid-cols-3 gap-8 my-24">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-emerald-400 mb-3">Análise de ZIP/APK</h3>
            <p className="text-slate-400">Extração segura de binários com proteção contra Zip Slip e Zip Bomb.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-emerald-400 mb-3">Prompt por Arquivo</h3>
            <p className="text-slate-400">Gera especificações e prompts prontos para reconstruir o software.</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-emerald-400 mb-3">Multi-Provedor IA</h3>
            <p className="text-slate-400">Compatível com NVIDIA NIM, DeepSeek, OpenAI e Ollama Cloud.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 p-8 text-center text-slate-500 text-sm bg-slate-900/30">
        <p className="mb-4">&copy; {new Date().getFullYear()} Engenharia Reversa. Todos os direitos reservados.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/privacidade" className="hover:text-emerald-400 transition">Política de Privacidade</a>
          <a href="/termos" className="hover:text-emerald-400 transition">Termos de Uso</a>
          <a href="/cookies" className="hover:text-emerald-400 transition">Política de Cookies</a>
        </div>
      </footer>
    </div>
  );
}
