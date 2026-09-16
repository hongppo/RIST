#!/usr/bin/env python3
"""Render the local schema Markdown as an offline document using stdlib only."""

from __future__ import annotations

from dataclasses import dataclass, field
from html import escape
from pathlib import Path
import re

from build_policies import DOWNLOAD_ICON, STYLE as POLICY_STYLE

ROOT = Path(__file__).resolve().parent.parent
HEADING = re.compile(r'^(#{2,4})\s+(.+?)\s*$')
EXPLICIT_ID = re.compile(r'\s+\{#([\w.-]+)\}$')
LIST_ITEM = re.compile(r'^(?:(?P<bullet>[-+*])|(?P<number>\d+)\.)\s+(.+)$')
INLINE = re.compile(
    r'(?P<code>`[^`\n]+`)|(?P<strong>\*\*.+?\*\*)|'
    r'(?P<link>\[[^\]\n]+\]\(#[\w.-]+\))|'
    r'(?P<escaped>\\[\\`*{}\[\]()#+\-.!|_>])'
)


def inline(text):
    """Allow code, bold, and local links; escape all source HTML."""
    result = []
    end = 0
    for match in INLINE.finditer(text):
        result.append(escape(text[end:match.start()]))
        token = match.group()
        if match.lastgroup == 'code':
            result.append('<code>' + escape(token[1:-1]) + '</code>')
        elif match.lastgroup == 'strong':
            result.append('<strong>' + inline(token[2:-2]) + '</strong>')
        elif match.lastgroup == 'link':
            label, target = token[1:-1].rsplit('](', 1)
            result.append('<a href="' + escape(target, quote=True) + '">' + inline(label) + '</a>')
        else:
            result.append(escape(token[1:]))
        end = match.end()
    result.append(escape(text[end:]))
    return ''.join(result)


def split_frontmatter(source):
    """Read only the flat frontmatter values used in the document header."""
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
            raise ValueError('The schema frontmatter needs a closing --- line.')
        lines = lines[end + 1:]
    return metadata, lines


def table_cells(line):
    """Split table cells, preserving escaped pipes and pipes inside inline code."""
    cells, current = [], []
    in_code = False
    escaped = False
    for character in line.strip():
        if escaped:
            current.append(character)
            escaped = False
        elif character == '\\':
            current.append(character)
            escaped = True
        elif character == '`':
            in_code = not in_code
            current.append(character)
        elif character == '|' and not in_code:
            cells.append(''.join(current).strip())
            current = []
        else:
            current.append(character)
    cells.append(''.join(current).strip())
    if line.strip().startswith('|'):
        cells.pop(0)
    if line.strip().endswith('|') and cells and cells[-1] == '':
        cells.pop()
    return cells


def table_separator(line):
    cells = table_cells(line)
    return bool(cells) and all(re.fullmatch(r':?-{3,}:?', cell) for cell in cells)


def render_table(rows, separator):
    columns = len(rows[0])
    if len(separator) != columns or any(len(row) != columns for row in rows):
        raise ValueError('Every schema table row must have the same number of columns.')
    alignments = []
    for cell in separator:
        alignment = 'center' if cell.startswith(':') and cell.endswith(':') else 'right' if cell.endswith(':') else 'left'
        alignments.append(alignment)
    kind = 'schema-columns' if rows[0] == ['컬럼명', '한글 이름', '자료형', 'NULL', '제약·설명'] else 'schema-catalog' if columns == 4 and rows[0][-1] == '바로가기' else 'schema-reference'

    def row_html(row, tag):
        return '<tr>' + ''.join(
            f'<{tag}' + (' scope="col"' if tag == 'th' else '') +
            (f' class="align-{alignment}"' if alignment != 'left' else '') +
            '>' + inline(cell) + f'</{tag}>'
            for cell, alignment in zip(row, alignments)
        ) + '</tr>'

    return '<div class="schema-table-wrap"><table class="' + kind + '">\n<thead>\n' + row_html(rows[0], 'th') + '\n</thead>\n<tbody>\n' + '\n'.join(row_html(row, 'td') for row in rows[1:]) + '\n</tbody>\n</table></div>'


@dataclass
class Section:
    level: int
    heading: str
    identifier: str
    blocks: list = field(default_factory=list)

    def render(self):
        group = ' schema-group' if self.level == 2 and any(isinstance(block, Section) for block in self.blocks) else ''
        return (
            f'<section class="policy-section schema-level-{self.level}{group}" id="{escape(self.identifier, quote=True)}" tabindex="-1">\n'
            f'<h{self.level}>' + inline(self.heading) + f'</h{self.level}>\n' +
            '\n'.join(block.render() if isinstance(block, Section) else block for block in self.blocks) +
            '\n</section>'
        )


def render_markdown(source):
    metadata, lines = split_frontmatter(source)
    blocks, stack, identifiers = [], [], set()
    position = 0

    def current():
        return stack[-1].blocks if stack else blocks

    def starts_block(index):
        line = lines[index].strip()
        return bool(HEADING.match(line) or LIST_ITEM.match(line) or
                    (index + 1 < len(lines) and '|' in line and table_separator(lines[index + 1])))

    while position < len(lines):
        line = lines[position].strip()
        if not line:
            position += 1
            continue
        heading = HEADING.match(line)
        if heading:
            level, title = len(heading[1]), heading[2]
            explicit = EXPLICIT_ID.search(title)
            identifier = explicit[1] if explicit else re.sub(r'\s+', '-', re.sub(r'[^\w\s-]', '', title).strip()).lower()
            if explicit:
                title = title[:explicit.start()]
            if not identifier:
                raise ValueError('A schema heading needs a nonempty identifier.')
            if identifier in identifiers:
                raise ValueError('Duplicate schema heading identifier: ' + identifier)
            identifiers.add(identifier)
            while stack and stack[-1].level >= level:
                stack.pop()
            section = Section(level, title, identifier)
            current().append(section)
            stack.append(section)
            position += 1
        elif position + 1 < len(lines) and '|' in line and table_separator(lines[position + 1]):
            rows = [table_cells(line)]
            separator = table_cells(lines[position + 1])
            position += 2
            while position < len(lines) and lines[position].strip() and '|' in lines[position]:
                rows.append(table_cells(lines[position]))
                position += 1
            current().append(render_table(rows, separator))
        elif LIST_ITEM.match(line):
            first = LIST_ITEM.match(line)
            ordered = first['number'] is not None
            tag = 'ol' if ordered else 'ul'
            start = ' start="' + first['number'] + '"' if ordered and first['number'] != '1' else ''
            items = []
            while position < len(lines):
                item = LIST_ITEM.match(lines[position].strip())
                if not item or (item['number'] is not None) != ordered:
                    break
                items.append('<li>' + inline(item[3]) + '</li>')
                position += 1
            current().append(f'<{tag}{start}>\n' + '\n'.join(items) + f'\n</{tag}>')
        else:
            paragraph = [line]
            position += 1
            while position < len(lines) and lines[position].strip() and not starts_block(position):
                paragraph.append(lines[position].strip())
                position += 1
            current().append('<p>' + inline(' '.join(paragraph)) + '</p>')
    content = '\n'.join(block.render() if isinstance(block, Section) else block for block in blocks)
    for target in re.findall(r'<a href="#([^"<>]+)">', content):
        if target not in identifiers:
            raise ValueError('Schema link has no matching heading: #' + target)
    return metadata, content


STYLE = POLICY_STYLE + '''
    .schema-document .policy-header .schema-meta { display: flex; flex-wrap: wrap; gap: 10px 24px; color: #62738a; font-size: 14px; line-height: 1.8; }
    .schema-document .schema-group { padding: 0; border: 0; background: transparent; margin-top: 36px; }
    .schema-group > h2 { margin: 0 0 22px; }
    .schema-level-3 > h3 { margin: 0 0 18px; color: #16263d; font-size: 23px; font-weight: 700; line-height: 1.45; overflow-wrap: anywhere; }
    .schema-level-4 { margin: 28px 0 0; padding: 24px 0 0; border: 0; border-top: 1px solid #dfe4eb; border-radius: 0; }
    .schema-level-4 > h4 { margin: 0 0 16px; color: #16263d; font-size: 19px; line-height: 1.5; }
    .schema-document p, .schema-document li { overflow-wrap: anywhere; }
    .schema-document .policy-section p, .schema-document .policy-section ul, .schema-document .policy-section ol { margin: 14px 0 0; font-size: 16px; line-height: 1.85; }
    .schema-document ul, .schema-document ol { padding-left: 24px; }
    .schema-document code { padding: 2px 4px; border-radius: 4px; background: #edf2f7; color: #264463; font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 0.88em; white-space: normal; overflow-wrap: anywhere; }
    .schema-document a { color: #285d94; text-decoration: underline; text-underline-offset: 3px; }
    .schema-document a:hover { color: #163d69; }
    .schema-document a:focus-visible { outline: 2px solid #365d87; outline-offset: 4px; border-radius: 2px; }
    .schema-table-wrap { width: 100%; margin: 18px 0; }
    .schema-table-wrap:last-child { margin-bottom: 0; }
    .schema-document table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 14px; line-height: 1.75; }
    .schema-document th, .schema-document td { padding: 12px 13px; border: 1px solid #dfe4eb; text-align: left; vertical-align: top; overflow-wrap: anywhere; word-break: normal; }
    .schema-document th { background: #eef3f8; color: #243e5c; font-weight: 700; }
    .schema-document tbody tr:nth-child(even) { background: #fafbfd; }
    .schema-document table code { padding: 0; background: transparent; font-size: 12.5px; line-height: 1.7; }
    .schema-columns th:nth-child(1) { width: 21%; }
    .schema-columns th:nth-child(2) { width: 14%; }
    .schema-columns th:nth-child(3) { width: 18%; }
    .schema-columns th:nth-child(4) { width: 6%; }
    .schema-columns th:nth-child(5) { width: 41%; }
    .schema-columns th:nth-child(4), .schema-columns td:nth-child(4) { text-align: center; padding-left: 6px; padding-right: 6px; white-space: nowrap; }
    .schema-catalog th:nth-child(1) { width: 25%; }
    .schema-catalog th:nth-child(2) { width: 22%; }
    .schema-catalog th:nth-child(3) { width: 45%; }
    .schema-catalog th:nth-child(4) { width: 8%; }
    .schema-catalog td:last-child { white-space: nowrap; }
    .schema-reference th:first-child { width: 26%; }
    .schema-document .align-center { text-align: center; }
    .schema-document .align-right { text-align: right; }
'''


def build_schema(root=ROOT):
    root = Path(root)
    source = root / 'docs' / 'rist-schema.md'
    if not source.is_file():
        return False
    metadata, content = render_markdown(source.read_text(encoding='utf-8'))
    details = []
    for key, label in [('version', '버전'), ('created_at', '작성일'), ('updated_at', '수정일')]:
        if value := metadata.get(key):
            if key.endswith('_at') and re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
                value = value.replace('-', '/')
            details.append('<span>' + label + ' ' + escape(value) + '</span>')
    document = '<!doctype html>\n<!-- Generated from docs/rist-schema.md. Edit the Markdown source, then run scripts/build_sources.py. -->\n'
    document += '<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    document += '<title>RIST · 통합 스키마</title>\n<style>' + STYLE + '</style>\n</head>\n<body>\n'
    document += '<main class="policy-document schema-document" data-document-root>\n<header class="policy-header has-labeled-download">\n'
    document += '<div class="document-header-main"><div class="policy-kicker">RIST · SCHEMA</div>\n<h1>통합 스키마</h1>\n'
    if details:
        document += '<div class="schema-meta">' + ''.join(details) + '</div>\n'
    document += '</div>\n<div class="document-download-row"><span class="document-download-label">통합 스키마.md</span><a data-document-download href="../docs/rist-schema.md" download="통합 스키마.md" class="document-download" title="통합 스키마 MD 다운로드" aria-label="통합 스키마 MD 다운로드">' + DOWNLOAD_ICON + '</a></div>\n'
    document += '</header>\n<div class="policy-sections">\n' + content + '\n</div>\n</main>\n</body>\n</html>\n'
    output = root / 'pages' / 'rist-schema.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(document, encoding='utf-8')
    return True


if __name__ == '__main__':
    if build_schema():
        print('Built pages/rist-schema.html from docs/rist-schema.md')
