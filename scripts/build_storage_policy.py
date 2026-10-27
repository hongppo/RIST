"""Render storage and original download policy."""
from pathlib import Path
import re
from build_extraction_rules import Renderer, document_html

def build_storage_policy(root):
    root = Path(root)
    slug = 'rist-storage-original-download-policy'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    links = {p: p.stem for p in (root / 'docs').glob('rist-*.md')}
    text = re.sub(r'\]\(#(rist-[a-z0-9-]+)\)', lambda m: '](' + m[1] + '.md)', source.read_text())
    meta, content = Renderer(root, source, links).render(text)
    title = '저장 및 원본 다운로드 정책'
    html = document_html(root, source, title, meta, content)
    html = html.replace('RIST · EXTRACTION RULES', 'RIST POLICIES').replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
    html = html.replace(slug + '.md', title + '.md')
    html = html.replace('../docs/' + title + '.md', '../docs/' + slug + '.md')
    (root / 'pages' / (slug + '.html')).write_text(html)
    return True
