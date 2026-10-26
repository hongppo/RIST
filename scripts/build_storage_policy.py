"""Render storage and original download policy."""
from pathlib import Path
from build_extraction_rules import Renderer, document_html

def build_storage_policy(root):
    root = Path(root)
    slug = 'rist-storage-original-download-policy'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    meta, content = Renderer(root, source, {}).render(source.read_text())
    title = '저장 및 원본 다운로드 정책'
    html = document_html(root, source, title, meta, content)
    html = html.replace('RIST · EXTRACTION RULES', 'RIST POLICIES').replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
    html = html.replace(slug + '.md', title + '.md')
    html = html.replace('../docs/' + title + '.md', '../docs/' + slug + '.md')
    (root / 'pages' / (slug + '.html')).write_text(html)
    return True
