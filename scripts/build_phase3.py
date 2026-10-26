"""Render the phase-three policy changes document."""
from pathlib import Path
from build_extraction_rules import Renderer, document_html

def build_phase3(root):
    root = Path(root)
    build_phase3_ui(root)
    slug = 'rist-phase3-policy-changes'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    meta, content = Renderer(root, source, {root / 'docs/rist-storage-original-download-policy.md': 'rist-storage-original-download-policy', root / 'docs/rist-policies.md': 'rist-policies', root / 'docs/extraction-rules/csv/csv-003.md': 'extraction-rule-csv-003', root / 'docs/extraction-rules/excel/excel-004.md': 'extraction-rule-excel-004'}).render(source.read_text())
    html = document_html(root, source, '정책 변경 사항', meta, content)
    html = html.replace('RIST · EXTRACTION RULES', 'RIST INTERFACE PLANNING')
    html = html.replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
    html = html.replace(slug + '.md 다운로드', '정책 변경 사항.md 다운로드').replace('download="' + slug + '.md"', 'download="정책 변경 사항.md"').replace('>' + slug + '.md</span>', '>정책 변경 사항.md</span>')
    (root / 'pages' / (slug + '.html')).write_text(html)
    return True


def build_phase3_ui(root):
    slug = 'rist-phase3-ui-changes'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    links = {root / 'pages' / (page + '.html'): page for page in ['rist-phase2-review-detail', 'rist-phase2-final-validation', 'rist-phase3-upload-history', 'rist-phase3-history-review', 'rist-phase3-history-complete', 'rist-phase3-history-expired', 'rist-phase3-history-failed']}
    meta, content = Renderer(root, source, links).render(source.read_text())
    html = document_html(root, source, 'UI 변경 사항', meta, content)
    html = html.replace('RIST · EXTRACTION RULES', 'RIST INTERFACE PLANNING').replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
    html = html.replace(slug + '.md 다운로드', 'UI 변경 사항.md 다운로드').replace('download="' + slug + '.md"', 'download="UI 변경 사항.md"').replace('>' + slug + '.md</span>', '>UI 변경 사항.md</span>')
    (root / 'pages' / (slug + '.html')).write_text(html)
    return True
