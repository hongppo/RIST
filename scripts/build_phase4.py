from pathlib import Path
import re
from build_extraction_rules import Renderer, document_html, download_row

def build_phase4(root):
    root = Path(root)
    names = {'rist-failed-upload-history-deletion-policy': '실패 파일 업로드 이력 삭제 정책', 'rist-phase4-ui-changes': 'UI 변경 사항', 'rist-phase4-multi-upload-policy': '여러 파일 업로드 정책', 'rist-phase4-group-storage-policy': '그룹 저장 및 원본 다운로드 정책', 'rist-phase4-policy-changes': '정책 변경 사항'}
    links = {p: p.stem for p in (root / 'pages').glob('*.html')}
    links.update({p: p.stem for p in (root / 'docs').glob('rist-*.md')})
    for slug, title in names.items():
        source = root / 'docs' / (slug + '.md')
        if not source.exists():
            continue
        text = re.sub(r'\]\(#(rist-[a-z0-9-]+)\)', lambda m: '](' + m[1] + '.md)', source.read_text())
        meta, content = Renderer(root, source, links).render(text)
        html = document_html(root, source, title, meta, content)
        html = html.replace('RIST · EXTRACTION RULES', 'RIST INTERFACE PLANNING').replace('docs/extraction-rules Markdown', 'docs/' + slug + '.md')
        html = html.replace(slug + '.md 다운로드', title + '.md 다운로드').replace('download="' + slug + '.md"', 'download="' + title + '.md"')
        if slug == 'rist-phase4-ui-changes':
            sources = sorted(p for p in (root / 'docs').glob('rist-phase4-*.md') if p.stem != slug and 'policy' not in p.stem)
            downloads = '<details><summary>화면별 기획서 다운로드</summary>' + ''.join(download_row(root, p) for p in sources) + '</details>'
            html = html.replace('</main>', downloads + '</main>')
        (root / 'pages' / (slug + '.html')).write_text(html)
