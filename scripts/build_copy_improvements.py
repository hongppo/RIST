"""Render the phase-two copy proposal without changing product mockups."""
from pathlib import Path
from build_schema import STYLE, DOWNLOAD_ICON, render_markdown

ROOT = Path(__file__).resolve().parent.parent


def build_copy_improvements(root=ROOT):
    root = Path(root)
    slug = 'rist-phase2-copy-improvements'
    source = root / ('docs/' + slug + '.md')
    if not source.is_file():
        return False
    _, content = render_markdown(source.read_text(encoding='utf-8'))
    style = STYLE + '\n.copy-document { min-height: 800px; } .copy-document th:nth-child(1) { width: 6%; } .copy-document th:nth-child(2) { width: 17%; } .copy-document th:nth-child(3) { width: 34%; } .copy-document th:nth-child(4) { width: 43%; }'
    document = ('<!doctype html>\n<!-- Generated from docs/' + slug + '.md. Run scripts/build_sources.py. -->\n'
        '<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
        '<title>문구 개선</title><style>' + style + '</style></head><body>'
        '<main class="policy-document schema-document copy-document" data-document-root>'
        '<header class="policy-header has-labeled-download"><h1>문구 개선</h1>'
        '<div class="document-download-row"><span class="document-download-label">문구 개선.md</span>'
        '<a data-document-download href="../docs/' + slug + '.md" download="문구 개선.md" class="document-download" aria-label="문구 개선 MD 다운로드">' + DOWNLOAD_ICON + '</a></div></header>'
        '<div class="policy-sections">' + content + '</div></main></body></html>\n')
    (root / ('pages/' + slug + '.html')).write_text(document, encoding='utf-8')
    return True
