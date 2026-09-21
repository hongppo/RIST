#!/usr/bin/env python3
"""Render the small, offline policy document from Markdown using stdlib only."""

from __future__ import annotations

from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent
POLICY_HEADING = re.compile(r'^## (.+?) \{#([a-z][a-z0-9-]*)\}$')


def inline(text):
    """Render escaped inline text and Obsidian links to stable policy IDs."""
    parts = []
    start = 0
    for match in re.finditer(r'\[\[#([^\]\n]+?) \{#([a-z][a-z0-9-]*)\}\|([^\]\n]+)\]\]', text):
        parts.append(inline(text[start:match.start()]))
        parts.append('<a href="#' + match[2] + '">' + escape(match[3]) + '</a>')
        start = match.end()
    if parts:
        parts.append(inline(text[start:]))
        return ''.join(parts)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', escape(text))


def split_frontmatter(source):
    """Read the flat metadata used in the policy document header."""
    lines = source.splitlines()
    metadata = {}
    if lines and lines[0].strip() == '---':
        for end in range(1, len(lines)):
            if lines[end].strip() == '---':
                break
            key, separator, value = lines[end].partition(':')
            if separator and key.strip() in {'version', 'created_at', 'updated_at'}:
                metadata[key.strip()] = value.strip().strip('"\'')
        else:
            raise ValueError('The policy frontmatter needs a closing --- line.')
        lines = lines[end + 1:]
    return metadata, lines


def render_markdown(source):
    from build_schema import table_cells, table_separator, render_table
    _, lines = split_frontmatter(source)
    title = None
    intro = []
    sections = []
    current = intro
    paragraph = []
    items = []
    identifiers = set()
    table_lines = []

    def flush():
        if table_lines:
            if len(table_lines) < 2 or not table_separator(table_lines[1]):
                raise ValueError('Policy tables need a header and separator row.')
            rows = [table_cells(table_lines[0])] + [table_cells(row) for row in table_lines[2:]]
            current.append(render_table(rows, table_cells(table_lines[1])))
            table_lines.clear()
        if paragraph:
            current.append('<p>' + inline(' '.join(paragraph)) + '</p>')
            paragraph.clear()
        if items:
            current.append('<ul>\n' + '\n'.join('<li>' + inline(item) + '</li>' for item in items) + '\n</ul>')
            items.clear()

    for number, raw in enumerate(lines, 1):
        line = raw.strip()
        if line.startswith('|'):
            if not table_lines:
                flush()
            table_lines.append(line)
            continue
        if table_lines:
            flush()
        if not line:
            flush()
            continue
        if line.startswith('# '):
            flush()
            if title is not None or intro or sections:
                raise ValueError(f'Line {number}: start with one # document title.')
            title = line[2:].strip()
        elif line.startswith('## '):
            flush()
            if line == '## 인덱스':
                line = '## 인덱스 {#policy-index}'
            match = POLICY_HEADING.fullmatch(line)
            if not match:
                raise ValueError(f'Line {number}: use ## Policy title {{#policy-id}} with a lowercase ID.')
            heading, identifier = match.groups()
            if identifier in identifiers:
                raise ValueError(f'Line {number}: duplicate policy ID: {identifier}')
            identifiers.add(identifier)
            current = []
            sections.append((identifier, heading, current))
        elif line.startswith('### '):
            flush()
            if not sections:
                raise ValueError(f'Line {number}: ### belongs inside a policy section.')
            current.append('<h3>' + inline(line[4:].strip()) + '</h3>')
        elif line.startswith('- '):
            if paragraph:
                flush()
            items.append(line[2:])
        else:
            if items:
                flush()
            paragraph.append(line)
    flush()
    if not title:
        raise ValueError('Start the policy document with a # title.')
    if not sections:
        raise ValueError('Add at least one ## Policy title {#policy-id} section.')
    content = '\n'.join(
        '<section class="policy-section" id="' + identifier + '" tabindex="-1">\n'
        '<h2>' + inline(heading) + '</h2>\n' + '\n'.join(blocks) + '\n</section>'
        for identifier, heading, blocks in sections
    )
    for target in re.findall(r'<a href="#([^"<>]+)">', '\n'.join(intro) + content):
        if target not in identifiers:
            raise ValueError(f'Unknown policy index target: {target}')
    return title, '\n'.join(intro), content


STYLE = '''
    * { box-sizing: border-box; }
    html, body { width: 1280px; margin: 0; }
    body { background: #fff; color: #24364f; font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; -webkit-font-smoothing: antialiased; }
    .policy-document { width: 1280px; height: auto; padding: 56px 72px 88px; }
    .policy-header { position: relative; padding-right: 64px; padding-bottom: 32px; border-bottom: 1px solid #dfe4eb; }
    .policy-header .document-download { position: absolute; top: 0; right: 0; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid #dfe4eb; border-radius: 8px; background: #fff; color: #365d87; text-decoration: none; }
    .policy-header .document-download:hover { border-color: #8fa9ca; background: #f5f8fc; color: #1c3553; }
    .policy-header .document-download:focus-visible { outline: 3px solid #8fa9ca; outline-offset: 3px; border-radius: 8px; }
    .policy-header.has-labeled-download { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 32px; padding-right: 0; }
    .document-download-row { display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: center; gap: 14px; max-width: 440px; }
    .document-download-label { color: #62738a; text-align: right; font-size: 13px; line-height: 1.65; overflow-wrap: anywhere; }
    .policy-header.has-labeled-download .document-download { position: static; flex-shrink: 0; }
    .document-download svg { width: 22px; height: 22px; }
    .policy-kicker { margin: 0 0 24px; color: #62738a; font-size: 12px; font-weight: 650; letter-spacing: 1.4px; }
    h1 { margin: 0 0 16px; color: #16263d; font-size: 38px; font-weight: 750; line-height: 1.3; letter-spacing: -1px; }
    .policy-header p { margin: 0; color: #62738a; font-size: 16px; line-height: 1.8; }
    .policy-header .policy-meta { display: flex; flex-wrap: wrap; gap: 10px 24px; color: #62738a; font-size: 14px; line-height: 1.8; }
    .policy-sections { padding-top: 36px; }
    .policy-section { margin: 0 0 24px; padding: 28px 32px; border: 1px solid #dfe4eb; border-radius: 12px; background: #fff; scroll-margin-top: 24px; }
    .policy-section:last-child { margin-bottom: 0; }
    .policy-section:focus, .policy-section.is-policy-target { outline: 3px solid #8fa9ca; outline-offset: 3px; border-color: #365d87; background: #f5f8fc; }
    h2 { margin: 0 0 18px; color: #16263d; font-size: 24px; font-weight: 700; line-height: 1.4; letter-spacing: -0.5px; }
    h3 { margin: 26px 0 12px; font-size: 19px; line-height: 1.5; }
    .policy-section p, .policy-section ul { margin: 14px 0 0; font-size: 17px; line-height: 1.85; }
    .policy-section ul { padding-left: 24px; }
    .policy-section li + li { margin-top: 5px; }
    .policy-section table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 18px 0; font-size: 15px; line-height: 1.75; }
    .policy-section th, .policy-section td { border: 1px solid #dfe4eb; padding: 12px 14px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    .policy-section th { background: #f3f6fa; color: #16263d; font-weight: 700; }
    .policy-section th:first-child, .policy-section td:first-child { width: 15%; }
    .policy-section .align-center { text-align: center; }
    .policy-section .align-right { text-align: right; }
    strong { color: #1c3553; font-weight: 700; }
'''

DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg>'


def build_policies(root=ROOT):
    root = Path(root)
    source = root / 'docs' / 'rist-policies.md'
    if not source.is_file():
        return False
    metadata, lines = split_frontmatter(source.read_text(encoding='utf-8'))
    title, intro, content = render_markdown('\n'.join(lines))
    details = []
    for key, label in [('version', '버전'), ('created_at', '작성일'), ('updated_at', '수정일')]:
        if value := metadata.get(key):
            if key.endswith('_at') and re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
                value = value.replace('-', '/')
            details.append('<span>' + label + ' ' + escape(value) + '</span>')
    html = '<!doctype html>\n<!-- Generated from docs/rist-policies.md. Edit the Markdown source, then run scripts/build_sources.py. -->\n'
    html += '<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    html += '<title>RIST · ' + escape(title) + '</title>\n<style>' + STYLE + '</style>\n</head>\n<body>\n'
    html += '<main class="policy-document" data-document-root>\n<header class="policy-header has-labeled-download">\n'
    html += '<div class="document-header-main"><div class="policy-kicker">RIST · POLICIES</div>\n<h1>' + inline(title) + '</h1>\n'
    if details:
        html += '<div class="policy-meta">' + ''.join(details) + '</div>\n'
    html += intro + '\n</div>\n'
    html += '<div class="document-download-row"><span class="document-download-label">정책 문서.md</span><a data-document-download href="../docs/rist-policies.md" download="정책 문서.md" class="document-download" title="정책 문서 MD 다운로드" aria-label="정책 문서 MD 다운로드">' + DOWNLOAD_ICON + '</a></div>\n</header>\n'
    html += '<div class="policy-sections">\n' + content + '\n</div>\n</main>\n</body>\n</html>\n'
    output = root / 'pages' / 'rist-policies.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(html, encoding='utf-8')
    return True


if __name__ == '__main__':
    if build_policies():
        print('Built pages/rist-policies.html from docs/rist-policies.md')
