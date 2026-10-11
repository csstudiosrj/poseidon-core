#!/bin/bash
# Roda da raiz do projeto: bash instalar.sh
set -e

RAIZ="$(pwd)"

echo "→ Verificando que estamos na raiz do projeto Poseidon..."
if [ ! -f "$RAIZ/package.json" ]; then
  echo "ERRO: rode este script da raiz do projeto (onde fica o package.json)"
  exit 1
fi

echo "→ Copiando arquivos..."

cp -f src/middleware.ts                              "$RAIZ/src/middleware.ts"
cp -f "src/app/(dashboard)/DashboardShell.tsx"      "$RAIZ/src/app/(dashboard)/DashboardShell.tsx"

mkdir -p "$RAIZ/src/app/(dashboard)/portfolio"
cp -f "src/app/(dashboard)/portfolio/page.tsx"      "$RAIZ/src/app/(dashboard)/portfolio/page.tsx"

cp -f "src/app/(dashboard)/configuracoes/page.tsx"  "$RAIZ/src/app/(dashboard)/configuracoes/page.tsx"
cp -f "src/app/(dashboard)/hub/loading.tsx"         "$RAIZ/src/app/(dashboard)/hub/loading.tsx"
cp -f "src/app/(dashboard)/setup/loading.tsx"       "$RAIZ/src/app/(dashboard)/setup/loading.tsx"
cp -f "src/app/(dashboard)/auditoria/loading.tsx"   "$RAIZ/src/app/(dashboard)/auditoria/loading.tsx"
cp -f "src/app/not-found.tsx"                       "$RAIZ/src/app/not-found.tsx"
cp -f "src/app/error.tsx"                           "$RAIZ/src/app/error.tsx"

echo ""
echo "✅ Pronto! 9 arquivos instalados."
echo ""
echo "Arquivos copiados:"
echo "  src/middleware.ts"
echo "  src/app/(dashboard)/DashboardShell.tsx"
echo "  src/app/(dashboard)/portfolio/page.tsx  ← pasta nova criada"
echo "  src/app/(dashboard)/configuracoes/page.tsx"
echo "  src/app/(dashboard)/hub/loading.tsx"
echo "  src/app/(dashboard)/setup/loading.tsx"
echo "  src/app/(dashboard)/auditoria/loading.tsx"
echo "  src/app/not-found.tsx"
echo "  src/app/error.tsx"
