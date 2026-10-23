"""Build phase 2.5 planning documents from Markdown sources."""
from pathlib import Path
from build_extraction_rules import Renderer, document_html

def build_phase25(root):
    root = Path(root)
    for suffix, title in [('cover', '표지'), ('change-history', '변경 히스토리'), ('policy-changes', '정책 변경 사항')]:
        slug = 'rist-phase25-' + suffix
        source = root / 'docs' / (slug + '.md')
        if not source.is_file():
            continue
        meta, content = Renderer(root, source, {root / "docs" / path: page for path, page in [("matching-rules/sampling-method.md", "rist-matching-sampling-method"), ("matching-rules/analysis-method-by-file-type.md", "rist-matching-analysis-method-by-file-type"), ("db-lists/medium.md", "rist-db-list-medium"), ("db-lists/analysis-method.md", "rist-db-list-analysis-method"), ("db-lists/sampling-method.md", "rist-db-list-sampling-method"), ("rist-policies.md", "rist-policies")]}).render(source.read_text())
        if suffix == 'cover':
            html = (root / 'scripts/templates/phase25-cover.html').read_text()
            html = html.replace('{{version}}', meta['version']).replace('{{date}}', meta['updated_at'].replace('-', '/'))
        else:
            html = document_html(root, source, title, meta, content)
            html = html.replace('RIST · EXTRACTION RULES', 'RIST · INTERFACE PLANNING')
            html = html.replace('docs/extraction-rules Markdown', 'docs/rist-phase25-*.md')
            html = html.replace(slug + '.md 다운로드', title + '.md 다운로드').replace('download="' + slug + '.md"', 'download="' + title + '.md"').replace('>' + slug + '.md</span>', '>' + title + '.md</span>')
        (root / 'pages' / (slug + '.html')).write_text(html)
