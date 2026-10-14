"""Render the policy changes document with links to canonical policy pages."""
from pathlib import Path
from build_extraction_rules import Renderer, document_html

def build_phase2_policy_changes(root):
    root=Path(root).resolve()
    slug='rist-phase2-policy-changes'
    source=root/'docs'/f'{slug}.md'
    if not source.is_file():
        return False
    pages={root/'docs'/name:page for name,page in [('rist-policies.md','rist-policies'),('matching-rules/location.md','rist-matching-location'),('db-lists/location.md','rist-db-list-location'),('extraction-rules/pdf/pdf-003.md','extraction-rule-pdf-003')]}
    meta,content=Renderer(root,source,pages).render(source.read_text())
    html=document_html(root,source,'정책 변경 사항',meta,content)
    html=html.replace('RIST · EXTRACTION RULES','RIST · POLICIES').replace(slug+'.md 다운로드','정책 변경 사항.md 다운로드').replace('download="'+slug+'.md"','download="정책 변경 사항.md"').replace('>'+slug+'.md</span>','>정책 변경 사항.md</span>')
    (root/'pages'/f'{slug}.html').write_text(html)
