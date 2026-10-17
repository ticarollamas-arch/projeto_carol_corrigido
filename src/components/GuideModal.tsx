import { X, ExternalLink, ShieldCheck, Zap, GitBranch, KeyRound } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenToken: () => void;
}

export function GuideModal({ isOpen, onClose, onOpenToken }: GuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Como Funciona o ZipToGit</h2>
        <p className="text-xs text-slate-400 mb-6">
          Guia rápido para publicação automática e espontânea de arquivos compactados no GitHub.
        </p>

        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <Zap className="w-4 h-4" />
              <span>1. Envio Espontâneo ao Anexar</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ao deixar ativada a opção <strong>"Envio Espontâneo ao Anexar"</strong>, basta arrastar qualquer arquivo <code className="text-emerald-300 font-mono">.zip</code> para a tela. O sistema imediatamente descompacta os arquivos, filtra diretórios indesejados (como <code className="text-slate-400 font-mono">node_modules/</code>), cria o repositório no GitHub se necessário e comita tudo instantaneamente.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-3">
            <div className="flex items-center gap-2 text-[#58a6ff] text-sm font-semibold">
              <KeyRound className="w-4 h-4" />
              <span>2. Como Obter seu Token do GitHub em 30 Segundos</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Acesse as configurações de desenvolvedor do GitHub ou use nosso atalho direto:
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo&description=ZipToGit+AutoPublisher"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#58a6ff] hover:underline ml-1 font-medium"
                >
                  <span>Gerar Token Pré-configurado</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Verifique se o escopo <code className="text-amber-400 font-mono">repo</code> está marcado (ele permite criar repositórios e enviar commits).
              </li>
              <li>
                Clique em <strong>"Generate token"</strong> no final da página do GitHub e copie o código que começa com <code className="text-slate-400 font-mono">ghp_...</code>
              </li>
              <li>
                Cole no ZipToGit. O token fica salvo no seu próprio navegador e pronto!
              </li>
            </ol>
            <button
              onClick={() => {
                onClose();
                onOpenToken();
              }}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              → Inserir meu token agora
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <GitBranch className="w-4 h-4" />
              <span>3. API Git Data Nativa</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O ZipToGit utiliza a API REST Git de baixo nível do GitHub (<code className="text-slate-400 font-mono">POST /git/blobs</code>, <code className="text-slate-400 font-mono">POST /git/trees</code> e <code className="text-slate-400 font-mono">POST /git/commits</code>). Isso garante performance máxima, suporte a arquivos binários (imagens, fontes) e integridade criptográfica SHA-1/SHA-256 idêntica ao utilitário <code className="text-slate-400 font-mono">git</code> de terminal.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>4. Privacidade e Segurança</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Não existe servidor intermediário armazenando seu código nem seu token. O processamento do ZIP acontece 100% no motor JavaScript do seu navegador com JSZip, e as requisições partem diretamente do seu cliente para os servidores oficiais da API do GitHub (<code className="text-slate-400 font-mono">api.github.com</code>).
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#30363d] mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-lg transition-colors cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
