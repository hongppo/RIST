"""Render the phase-three policy changes document."""
from pathlib import Path
from build_extraction_rules import Renderer, document_html

def build_phase3(root):
    root = Path(root)
    build_phase3_ui(root)
    build_type_rule_overview(root)
    slug = 'rist-phase3-policy-changes'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    meta, content = Renderer(root, source, {root / 'docs/rist-storage-original-download-policy.md': 'rist-storage-original-download-policy', root / 'docs/rist-policies.md': 'rist-policies', root / 'docs/extraction-rules/csv/csv-003.md': 'extraction-rule-csv-003', root / 'docs/extraction-rules/excel/excel-004.md': 'extraction-rule-excel-004', root / 'docs/matching-rules/analysis-method.md': 'rist-matching-analysis-method', root / 'docs/matching-rules/analysis-method-by-file-type.md': 'rist-matching-analysis-method-by-file-type', root / 'docs/db-lists/analysis-method.md': 'rist-db-list-analysis-method'}).render(source.read_text())
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


def build_type_rule_overview(root):
    slug = 'rist-phase3-type-rule-overview'
    title = '유형별 적용 규칙 총괄표'
    source = root / 'docs' / (slug + '.md')
    if not source.is_file():
        return False
    from build_extraction_rules import discover_rules
    links = {p: p.stem for p in (root / 'docs').glob('rist-*.md')}
    links.update({p: 'extraction-rule-' + p.stem for p in discover_rules(root)})
    links[root / 'docs/extraction-rules/index.md'] = 'extraction-rules-index'
    links.update({p: 'rist-matching-' + p.stem for p in (root / 'docs/matching-rules').glob('*.md')})
    links.update({p: 'rist-db-lists-index' if p.stem == 'index' else 'rist-db-list-' + p.stem for p in (root / 'docs/db-lists').glob('*.md')})
    meta, content = Renderer(root, source, links).render(source.read_text())
    html = document_html(root, source, title, meta, content)
    html = html.replace('<span>작성일 ', '<span>생성일 ').replace('<span>수정일 ', '<span>최종 수정일 ')
    html = html.replace('RIST · EXTRACTION RULES', 'RIST POLICY').replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
    html = html.replace(slug + '.md 다운로드', title + '.md 다운로드').replace('download="' + slug + '.md"', 'download="' + title + '.md"')
    html = html.replace('</style>', '.schema-table-wrap { overflow-x: auto; } .schema-document td, .schema-document th { overflow-wrap: anywhere; } .schema-document table:has(th:nth-child(6)) th:nth-child(1) { width: 14%; } .schema-document table:has(th:nth-child(6)) th:nth-child(2) { width: 14%; } .schema-document table:has(th:nth-child(6)) th:nth-child(3) { width: 17%; } .schema-document table:has(th:nth-child(6)) th:nth-child(4) { width: 22%; } .schema-document table:has(th:nth-child(6)) th:nth-child(5) { width: 18%; } .schema-document table:has(th:nth-child(6)) th:nth-child(6) { width: 15%; }</style>')
    (root / 'pages' / (slug + '.html')).write_text(html)
    return True
