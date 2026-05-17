// src/app/teste-design/page.tsx
export default function TesteDesignPage() {
    return (
      <div className="min-h-screen bg-sea-950 antialiased font-sans p-6 md:p-10 space-y-8">
  
        {/* TÍTULO PRINCIPAL */}
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Teste de Design System — Poseidon
          </h1>
          <p className="text-slate-200 text-sm mt-1">
            Esta página demonstra todos os elementos do Design System Deep Sea.
          </p>
        </div>
  
        {/* CARD DE EXEMPLO (usando classe card do globals.css) */}
        <div className="card p-6 space-y-4">
          <h2 className="text-white text-lg font-semibold tracking-tight">Card de Exemplo</h2>
          <p className="text-white/50 text-xs">Subtítulo do card em caixa alta</p>
          <p className="text-slate-200 text-sm">Corpo de texto padrão secundário.</p>
  
          {/* Badges usando classes customizadas */}
          <div className="flex gap-2 flex-wrap">
            <span className="badge badge-ok">Ativo</span>
            <span className="badge badge-warning">Rascunho</span>
            <span className="badge badge-danger">Pendente</span>
            {/* Para "Finalizado" e "Inativo" não temos classes prontas, mas podemos estender o padrão */}
            <span className="badge bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">Finalizado</span>
            <span className="badge bg-white/5 text-slate-400 border border-white/10">Inativo</span>
          </div>
  
          {/* Valores numéricos */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <span className="text-[10px] font-semibold tracking-wide uppercase text-white/50 block">Valor Captado</span>
              <p className="text-white font-mono tabular-nums text-lg">R$ 1.234.567,89</p>
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wide uppercase text-white/50 block">Data Limite</span>
              <p className="text-white font-mono tabular-nums text-lg">2026-12-31</p>
            </div>
          </div>
        </div>
  
        {/* FORMULÁRIO DE EXEMPLO (card) */}
        <div className="card p-6 space-y-4">
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
        <div className="card p-6 space-y-4">
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
    );
  }