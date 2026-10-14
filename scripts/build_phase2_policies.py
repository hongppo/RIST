"""Render phase-two policy reading pages from Markdown; never modify PoC sources."""
from pathlib import Path
from build_schema import STYLE, DOWNLOAD_ICON, render_markdown
ROOT=Path(__file__).resolve().parent.parent

def build_phase2_policies(root=ROOT):
    root=Path(root)
    slug='rist-phase2-nas-deduplication'
    title='NAS 보관 시 중복 데이터 검사'
    source=root/'docs'/f'{slug}.md'
    if not source.exists(): return False
    _, content=render_markdown(source.read_text(encoding='utf-8'))
    html=('<!doctype html>\n<!-- Generated from docs/'+slug+'.md. Run scripts/build_sources.py. -->\n'
          '<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
          '<title>'+title+'</title><style>'+STYLE+'</style></head><body><main class="policy-document schema-document" data-document-root>'
          '<header class="policy-header has-labeled-download"><h1>'+title+'</h1><div class="document-download-row">'
          '<span class="document-download-label">'+title+'.md</span><a data-document-download href="../docs/'+slug+'.md" download="'+title+'.md" class="document-download" aria-label="정책 MD 다운로드">'+DOWNLOAD_ICON+'</a></div></header>'
          '<div class="policy-sections">'+content+'</div></main></body></html>\n')
    (root/'pages'/f'{slug}.html').write_text(html,encoding='utf-8')
    return True
