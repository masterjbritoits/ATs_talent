#!/usr/bin/env python3
"""
PPT Agent Pipeline — ITSector Talent ATS
========================================
Orquestra 3 agentes Claude em sequência:
  1. PPT Designer     — gera código python-pptx premium
  2. Commercial Agent — adiciona camada comercial e de valor
  3. CEO Reviewer     — revisão executiva + score + versão final

Cada execução:
  - Lê o gerar_ppt.py atual como base
  - Lê contexto do produto (README, docs, ADMIN_MANUAL)
  - Cria uma nova versão versionada em ppt_versions/
  - Actualiza gerar_ppt.py com a versão aprovada
  - Executa python-pptx para gerar o ficheiro .pptx

Uso:
  python ppt_agent_pipeline.py
  python ppt_agent_pipeline.py --dry-run          # não gera .pptx
  python ppt_agent_pipeline.py --start-from 2     # começa no agente comercial
  python ppt_agent_pipeline.py --version-only     # só lista versões
"""

import os
import sys
import re
import json
import argparse
import subprocess
from pathlib import Path
from datetime import datetime, timezone

try:
    import anthropic
except ImportError:
    print("[ERRO] Instala o SDK: pip install anthropic")
    sys.exit(1)

# ─── CONFIG ──────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent
VERSIONS_DIR = ROOT / "ppt_versions"
AGENTS_DIR = ROOT / ".claude" / "agents"
CURRENT_PPT_SCRIPT = ROOT / "gerar_ppt.py"
OUTPUT_PPTX = ROOT / "ITSector_Talent_ATS_Comercial.pptx"

MODEL = "claude-opus-4-5"
MAX_TOKENS = 8192

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def read_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8", errors="replace")

def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def next_version() -> str:
    """Calcula próximo número de versão baseado nos ficheiros existentes."""
    VERSIONS_DIR.mkdir(exist_ok=True)
    existing = sorted(VERSIONS_DIR.glob("v*_gerar_ppt.py"))
    if not existing:
        return "v01"
    last = existing[-1].name  # e.g. v03_gerar_ppt.py
    m = re.match(r"v(\d+)_", last)
    n = int(m.group(1)) + 1 if m else 1
    return f"v{n:02d}"

def list_versions():
    VERSIONS_DIR.mkdir(exist_ok=True)
    versions = sorted(VERSIONS_DIR.glob("v*_gerar_ppt.py"))
    if not versions:
        print("Nenhuma versão anterior encontrada.")
        return
    print(f"\n{'Versão':<10} {'Data':<22} {'Tamanho'}")
    print("-" * 50)
    for v in versions:
        stat = v.stat()
        ts = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
        print(f"{v.stem:<10} {ts:<22} {stat.st_size // 1024}KB")
    # Mostra score se existir
    for v in versions:
        score_file = VERSIONS_DIR / v.name.replace("_gerar_ppt.py", "_ceo_review.txt")
        if score_file.exists():
            first_line = score_file.read_text().split("\n")[0]
            print(f"  └─ {v.stem}: {first_line}")

def extract_python_code(text: str) -> str:
    """Extrai bloco ```python ... ``` do output do agente."""
    # Tenta blocos de código explícitos
    patterns = [
        r"```python\n(.*?)```",
        r"```\n(.*?)```",
        r"=== CÓDIGO PYTHON FINAL ===\n(.*?)(?:===|\Z)",
    ]
    for pattern in patterns:
        m = re.search(pattern, text, re.DOTALL)
        if m:
            code = m.group(1).strip()
            # Valida que parece código Python real
            if "from pptx" in code or "import pptx" in code or "prs.slides" in code:
                return code

    # Fallback: se o texto inteiro parece ser código Python
    if text.strip().startswith("#!/") or text.strip().startswith("from pptx") or "prs.slides.add_slide" in text:
        return text.strip()

    return ""

def extract_ceo_score(text: str) -> str:
    """Extrai secção de review do CEO (antes do código)."""
    m = re.search(r"(=== CEO REVIEW ===.*?)(?:=== CÓDIGO PYTHON FINAL ===|\Z)", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    # Extrai primeiras linhas até ao código
    lines = text.split("\n")
    review_lines = []
    for line in lines:
        if "```python" in line or "from pptx" in line:
            break
        review_lines.append(line)
    return "\n".join(review_lines).strip()

def build_product_context() -> str:
    """Agrega contexto do produto para passar aos agentes."""
    sections = []

    readme = read_file(ROOT / "README.md")
    if readme:
        sections.append(f"## README / Product Overview\n{readme[:3000]}")

    arch = read_file(ROOT / "docs" / "architecture.md")
    if arch:
        sections.append(f"## Architecture\n{arch[:2000]}")

    scoring = read_file(ROOT / "docs" / "scoring-engine.md")
    if scoring:
        sections.append(f"## Scoring Engine\n{scoring[:1500]}")

    admin = read_file(ROOT / "ADMIN_MANUAL.md")
    if admin:
        sections.append(f"## Admin Manual\n{admin[:1500]}")

    return "\n\n---\n\n".join(sections)

# ─── AGENT CALLS ─────────────────────────────────────────────────────────────

def call_agent(
    client: anthropic.Anthropic,
    agent_name: str,
    system_prompt: str,
    user_message: str,
    label: str
) -> str:
    print(f"\n{'='*60}")
    print(f"  AGENTE: {label}")
    print(f"{'='*60}")
    print("  A processar... (pode demorar 30-90s)")

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )

    content = response.content[0].text
    print(f"  ✓ Concluído ({len(content)} chars, {response.usage.output_tokens} tokens)")
    return content


def run_designer(client: anthropic.Anthropic, current_code: str, product_context: str) -> str:
    system = read_file(AGENTS_DIR / "ppt-designer.md")
    user = f"""Estás a melhorar uma apresentação PowerPoint existente para o ITSector Talent Inbox ATS.

## Código Actual
```python
{current_code[:6000]}
```
[... código continua com mais slides ...]

## Contexto do Produto
{product_context[:3000]}

## Tarefa
Gera uma versão **melhorada e completa** do código Python.
Mantém a estrutura de 16 slides mas melhora:
- Conteúdo de cada slide com informação mais precisa do produto
- Design com mais detalhe e impacto visual
- Métricas e números mais concretos
- Animação de layout (variedade de composições)

Devolve o código Python **completo** entre ```python e ```.
Inclui TODAS as funções helper e TODOS os slides (1-16).
O ficheiro deve ser auto-contido e executável.
Gera o output em: ITSector_Talent_ATS_Comercial.pptx"""

    return call_agent(client, "ppt-designer", system, user, "PPT Designer")


def run_commercial(client: anthropic.Anthropic, designer_output: str, product_context: str) -> str:
    system = read_file(AGENTS_DIR / "commercial-agent.md")
    designer_code = extract_python_code(designer_output)

    user = f"""Recebes o código Python de uma apresentação técnica sobre o ITSector Talent ATS.
A tua missão é torná-la comercialmente irresistível para decisores empresariais.

## Código do Designer
```python
{designer_code[:7000] if designer_code else designer_output[:7000]}
```

## Contexto do Produto
{product_context[:2000]}

## Transformações Obrigatórias
1. Títulos de slides mais comerciais e orientados a valor
2. Adiciona estatísticas de mercado em cards de destaque (com fonte)
3. Substitui jargão técnico por linguagem de negócio
4. Slide ROI com calculadora visual concreta
5. Slide de preços com 3 tiers (Starter / Professional / Enterprise)
6. Slide final com 3 CTAs claros
7. Tagline poderosa na capa: "Transformar o recrutamento numa vantagem competitiva"

Devolve o código Python **completo** entre ```python e ```.
Mantém TODOS os 16 slides. O código deve ser executável."""

    return call_agent(client, "commercial-agent", system, user, "Commercial Agent")


def run_ceo(client: anthropic.Anthropic, commercial_output: str) -> str:
    system = read_file(AGENTS_DIR / "ceo-reviewer.md")
    commercial_code = extract_python_code(commercial_output)

    user = f"""Faz a revisão executiva final desta apresentação antes de enviar ao cliente.

## Código Actual (Designer + Comercial)
```python
{commercial_code[:7000] if commercial_code else commercial_output[:7000]}
```

## Tua Missão
1. Avalia nos 5 critérios (score /100)
2. Identifica 3 pontos fortes
3. Aplica 3 melhorias concretas
4. Devolve o código Python FINAL completo

## Formato de Output Obrigatório
Começa com:
```
=== CEO REVIEW ===
Score: XX/100
...
```
Depois:
```
=== CÓDIGO PYTHON FINAL ===
```python
[código completo executável]
```
```

O código final deve gerar uma apresentação que feche negócios."""

    return call_agent(client, "ceo-reviewer", system, user, "CEO Reviewer")

# ─── EXECUÇÃO DO PIPELINE ────────────────────────────────────────────────────

def run_pipeline(args):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[ERRO] Variável ANTHROPIC_API_KEY não definida.")
        print("  Adiciona ao .env ou exporta: $env:ANTHROPIC_API_KEY='sk-ant-...'")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    version = next_version()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    print(f"\n{'='*60}")
    print(f"  ITSector PPT Agent Pipeline")
    print(f"  Versão: {version} | {timestamp}")
    print(f"{'='*60}")

    current_code = read_file(CURRENT_PPT_SCRIPT)
    product_context = build_product_context()

    if not current_code:
        print("[AVISO] gerar_ppt.py não encontrado — a começar do zero")
        current_code = "# Placeholder — sem código anterior"

    start_from = getattr(args, "start_from", 1)

    # ── Agente 1: Designer ──────────────────────────────────────────
    if start_from <= 1:
        designer_output = run_designer(client, current_code, product_context)
        write_file(VERSIONS_DIR / f"{version}_designer_raw.txt", designer_output)
    else:
        # Usa código atual como input para o próximo agente
        designer_output = f"```python\n{current_code}\n```"
        print(f"\n  [skip] Designer — usando código existente")

    # ── Agente 2: Commercial ────────────────────────────────────────
    if start_from <= 2:
        commercial_output = run_commercial(client, designer_output, product_context)
        write_file(VERSIONS_DIR / f"{version}_commercial_raw.txt", commercial_output)
    else:
        commercial_output = designer_output
        print(f"\n  [skip] Commercial Agent — usando output anterior")

    # ── Agente 3: CEO ───────────────────────────────────────────────
    ceo_output = run_ceo(client, commercial_output)
    write_file(VERSIONS_DIR / f"{version}_ceo_raw.txt", ceo_output)

    # ── Extrair código final ─────────────────────────────────────────
    final_code = extract_python_code(ceo_output)
    if not final_code:
        # Fallback: tenta código do agente comercial
        print("  [AVISO] CEO não devolveu código Python válido — usando output comercial")
        final_code = extract_python_code(commercial_output)

    if not final_code:
        print("  [ERRO] Nenhum agente devolveu código Python válido.")
        print("  Verifica os ficheiros raw em ppt_versions/")
        sys.exit(1)

    # ── Guardar versão versionada ────────────────────────────────────
    versioned_path = VERSIONS_DIR / f"{version}_gerar_ppt.py"
    write_file(versioned_path, final_code)
    print(f"\n  ✓ Código guardado: {versioned_path.name}")

    # ── Guardar review CEO ───────────────────────────────────────────
    ceo_review = extract_ceo_score(ceo_output)
    if ceo_review:
        review_path = VERSIONS_DIR / f"{version}_ceo_review.txt"
        write_file(review_path, ceo_review)
        print(f"  ✓ Review guardada: {review_path.name}")
        print(f"\n{ceo_review[:400]}")

    # ── Actualiza gerar_ppt.py principal ────────────────────────────
    write_file(CURRENT_PPT_SCRIPT, final_code)
    print(f"\n  ✓ gerar_ppt.py actualizado com versão {version}")

    # ── Gera o .pptx ────────────────────────────────────────────────
    if not getattr(args, "dry_run", False):
        print(f"\n  A gerar {OUTPUT_PPTX.name}...")
        result = subprocess.run(
            [sys.executable, str(CURRENT_PPT_SCRIPT)],
            capture_output=True,
            text=True,
            cwd=str(ROOT)
        )
        if result.returncode == 0:
            if OUTPUT_PPTX.exists():
                size_kb = OUTPUT_PPTX.stat().st_size // 1024
                print(f"  ✓ {OUTPUT_PPTX.name} gerado ({size_kb}KB)")
            else:
                print(f"  ✓ Script executou sem erros")
        else:
            print(f"  [ERRO] Falha ao gerar .pptx:")
            print(result.stderr[:1000])
            print("\n  O código Python foi guardado mas o .pptx não foi gerado.")
            print(f"  Podes tentar manualmente: python {CURRENT_PPT_SCRIPT.name}")
    else:
        print("\n  [dry-run] .pptx não gerado — usa --no-dry-run para gerar")

    print(f"\n{'='*60}")
    print(f"  Pipeline concluído — versão {version}")
    print(f"{'='*60}\n")

# ─── ENTRY POINT ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Pipeline de agentes Claude para gerar apresentação PPT ITSector"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Corre os agentes mas não executa o python-pptx"
    )
    parser.add_argument(
        "--start-from", type=int, choices=[1, 2, 3], default=1, metavar="N",
        help="Começa do agente N (1=Designer, 2=Commercial, 3=CEO)"
    )
    parser.add_argument(
        "--version-only", action="store_true",
        help="Lista versões anteriores e sai"
    )
    args = parser.parse_args()

    if args.version_only:
        list_versions()
        return

    run_pipeline(args)


if __name__ == "__main__":
    main()
