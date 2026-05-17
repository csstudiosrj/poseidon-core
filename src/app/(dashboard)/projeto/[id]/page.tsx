// src/app/(dashboard)/projeto/[id]/page.tsx
// ... imports mantidos

function CollapsibleSection({ titulo, conteudo }: { titulo: string; conteudo: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div>
      <button
        onClick={() => setAberto(!aberto)}
        className="flex items-center gap-2 w-full text-left text-xs font-semibold text-white/60 hover:text-white/90 transition-colors mb-1 cursor-pointer"
      >
        <span className={`transition-transform ${aberto ? "rotate-90" : ""}`}>▶</span>
        {titulo}
      </button>
      {aberto && (
        <p className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap pl-5">{conteudo}</p>
      )}
    </div>
  );
}