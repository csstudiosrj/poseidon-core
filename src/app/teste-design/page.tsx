// src/app/teste-design/page.tsx
export default function TesteDesignPage() {
    return (
      <div className="min-h-screen bg-sea-950 antialiased font-sans p-6 md:p-10">
        <div className="max-w-4xl mx-auto space-y-8">
  
          {/* TÍTULO PRINCIPAL */}
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Teste de Design System — Poseidon
          </h1>
          <p className="text-slate-200 text-sm">
            Esta página demonstra todos os elementos do Design System Deep Sea.
          </p>
  
          {/* CARD DE EXEMPLO */}
          <div className="bg-sea-900 border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-white text-lg font-semibold tracking-tight">Card de Exemplo</h2>
            <p className="text-white/50 text-xs">Subtítulo do card em caixa alta</p>
            <p className="text-slate-200 text-sm">Corpo de texto padrão secundário.</p>
  
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                Ativo
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/15">
                Rascunho
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/15">
                Pendente
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                Finalizado
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-white/5 text-slate-400 border border-white/10">
                Inativo
              </span>
            </div>
  
            {/* Valores numéricos */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <span className="text-[10px] font-semibold tracking-wide uppercase text-white/50">Valor Captado</span>
                <p className="text-white font-mono tabular-nums text-lg">R$ 1.234.567,89</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wide uppercase text-white/50">Data Limite</span>
                <p className="text-white font-mono tabular-nums text-lg">2026-12-31</p>
              </div>
            </div>
          </div>
  
          {/* FORMULÁRIO DE EXEMPLO */}
          <div className="bg-sea-900 border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-white text-lg font-semibold tracking-tight">Formulário</h2>
            <div>
              <label className="text-[10px] font-semibold tracking-wide uppercase text-white/50 block mb-1">Nome do Projeto</label>
              <input
                type="text"
                placeholder="Digite o nome..."
                className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-wide uppercase text-white/50 block mb-1">E-mail</label>
              <input
                type="email"
                placeholder="email@exemplo.com"
                className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button className="bg-cyan-500 hover:bg-cyan-400 text-sea-950 text-xs font-bold h-10 px-6 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                Salvar Projeto
              </button>
              <button className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold cursor-pointer text-[11px] bg-transparent border-none p-0 inline">
                Cancelar
              </button>
            </div>
            <p className="text-white/40 text-xs">Campos obrigatórios marcados com *</p>
          </div>
  
          {/* ESTADO DESABILITADO */}
          <div className="bg-sea-900 border border-white/5 rounded-lg p-6 space-y-4">
            <h2 className="text-white text-lg font-semibold tracking-tight">Estado Desabilitado</h2>
            <input
              type="text"
              disabled
              placeholder="Campo desabilitado"
              className="w-full bg-sea-950 border border-white/10 rounded-lg h-10 px-3 text-xs text-white placeholder-white/20 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              disabled
              className="bg-cyan-500 text-sea-950 text-xs font-bold h-10 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.15)] disabled:opacity-50 cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
  
        </div>
      </div>
    );
  }