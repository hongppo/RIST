#!/usr/bin/env python3
"""Build the extraction-rule catalog and offline documents from their Markdown."""

from __future__ import annotations

from dataclasses import dataclass, field
from html import escape
from pathlib import Path
import json
import re
from urllib.parse import quote, unquote, urlsplit

from build_policies import DOWNLOAD_ICON
from build_schema import EXPLICIT_ID, HEADING, LIST_ITEM, STYLE as SCHEMA_STYLE
from build_schema import split_frontmatter, table_cells, table_separator

ROOT = Path(__file__).resolve().parent.parent
TYPES = ('csv', 'excel', 'pdf')
RULE_NAME = re.compile(r'^(csv|excel|pdf)-(\d+)\.md$')
FENCE = re.compile(r'^(`{3,}|~{3,})([\w+-]*)\s*$')
INLINE = re.compile(
    r'(?P<code>`[^`\n]+`)|(?P<strong>\*\*.+?\*\*)|'
    r'(?P<link>\[[^\]\n]+\]\((?:<[^>\n]+>|[^\s()]+)\))|'
    r'(?P<escaped>\\[\\`*{}\[\]()#+\-.!|_>])'
)
GENERATED_MARKER = '<!-- Generated extraction-rule document.'


def inside(path, directory):
    """Do not follow document symlinks outside their permitted tree."""
    try:
        path.resolve().relative_to(directory.resolve())
        return True
    except ValueError:
        return False


def discover_rules(root):
    folder = root / 'docs' / 'extraction-rules'
    rules = []
    for kind in TYPES:
        for path in (folder / kind).glob('*.md'):
            match = RULE_NAME.fullmatch(path.name)
            if match and match[1] == kind and path.is_file() and inside(path, folder):
                rules.append(path)
    return sorted(rules, key=lambda path: (path.parent.name, int(RULE_NAME.fullmatch(path.name)[2]), path.name))


def rebuild_index(source, rules):
    """Keep the exact frontmatter, and derive every catalog row from a rule file."""
    split_frontmatter(source)  # Validate before changing the source.
    lines = source.splitlines(keepends=True)
    frontmatter = ''
    if lines and lines[0].strip() == '---':
        end = next(index for index in range(1, len(lines)) if lines[index].strip() == '---')
        frontmatter = ''.join(lines[:end + 1]).rstrip('\r\n') + '\n\n'
    body = ['## 파일 유형', '', '| 파일 유형 | 바로가기 |', '| --- | --- |']
    body.extend(f'| {kind.upper()} | [이동](#{kind}) |' for kind in TYPES)
    for kind in TYPES:
        body.extend(['', f'## {kind.upper()}', '', '| 규칙명 | 바로가기 |', '| --- | --- |'])
        body.extend(f'| {rule.stem.upper()} | [상세]({kind}/{rule.name}) |'
                    for rule in rules if rule.parent.name == kind)
    return frontmatter + '\n'.join(body) + '\n'


@dataclass
class Section:
    level: int
    heading: str
    identifier: str
    blocks: list = field(default_factory=list)

    def render(self, renderer):
        group = ' schema-group' if self.level == 2 and any(isinstance(block, Section) for block in self.blocks) else ''
        return (
            f'<section class="policy-section schema-level-{self.level}{group}" id="{escape(self.identifier, quote=True)}" tabindex="-1">\n'
            f'<h{self.level}>' + renderer.inline(self.heading) + f'</h{self.level}>\n' +
            '\n'.join(block.render(renderer) if isinstance(block, Section) else block for block in self.blocks) +
            '\n</section>'
        )


class Renderer:
    """A deliberately limited Markdown renderer with an explicit local-link map."""

    def __init__(self, root, source, page_map):
        self.root = root.resolve()
        self.source = source
        self.page_map = {path.resolve(): page for path, page in page_map.items()}

    def link_attributes(self, destination):
        if destination.startswith('<') and destination.endswith('>'):
            destination = destination[1:-1]
        if any(ord(character) < 32 for character in destination) or '\\' in destination:
            return None
        try:
            parsed = urlsplit(destination)
        except ValueError:
            return None
        if parsed.scheme or parsed.netloc:
            if parsed.scheme in {'https', 'http'} and parsed.netloc:
                return {'href': destination}
            return None
        if parsed.query:
            return None
        anchor = unquote(parsed.fragment)
        if not parsed.path:
            return {'href': '#' + quote(anchor)} if anchor else None
        local_path = unquote(parsed.path)
        if any(ord(character) < 32 for character in local_path) or '\\' in local_path:
            return None
        target = (self.source.parent / local_path).resolve()
        if not inside(target, self.root):
            return None
        if target in self.page_map:
            page = self.page_map[target]
            attributes = {'href': page + '.html' + ('#' + quote(anchor) if anchor else ''), 'data-viewer-page': page}
            if anchor:
                attributes['data-viewer-anchor'] = anchor
            return attributes
        return None

    def inline(self, value):
        result, end = [], 0
        for match in INLINE.finditer(value):
            result.append(escape(value[end:match.start()]))
            token = match.group()
            if match.lastgroup == 'code':
                result.append('<code>' + escape(token[1:-1]) + '</code>')
            elif match.lastgroup == 'strong':
                result.append('<strong>' + self.inline(token[2:-2]) + '</strong>')
            elif match.lastgroup == 'link':
                label, target = token[1:-1].rsplit('](', 1)
                attributes = self.link_attributes(target)
                if attributes is None:
                    result.append(self.inline(label))
                else:
                    result.append('<a ' + ' '.join(key + '="' + escape(value, quote=True) + '"'
                                                  for key, value in attributes.items()) + '>' + self.inline(label) + '</a>')
            else:
                result.append(escape(token[1:]))
            end = match.end()
        result.append(escape(value[end:]))
        return ''.join(result)

    def table(self, rows, separator):
        columns = len(rows[0])
        if len(separator) != columns or any(len(row) != columns for row in rows):
            raise ValueError('Every extraction-rule table row must have the same number of columns.')
        alignments = ['center' if cell.startswith(':') and cell.endswith(':') else
                      'right' if cell.endswith(':') else 'left' for cell in separator]

        def row_html(row, tag):
            return '<tr>' + ''.join(
                f'<{tag}' + (' scope="col"' if tag == 'th' else '') +
                (f' class="align-{alignment}"' if alignment != 'left' else '') +
                '>' + self.inline(cell) + f'</{tag}>' for cell, alignment in zip(row, alignments)
            ) + '</tr>'

        kind = 'extraction-catalog' if rows[0][-1] == '바로가기' else 'schema-reference'
        return '<div class="schema-table-wrap"><table class="' + kind + '">\n<thead>\n' + row_html(rows[0], 'th') + '\n</thead>\n<tbody>\n' + '\n'.join(row_html(row, 'td') for row in rows[1:]) + '\n</tbody>\n</table></div>'

    def render(self, source):
        metadata, lines = split_frontmatter(source)
        blocks, stack, identifiers = [], [], set()
        position = 0

        def current():
            return stack[-1].blocks if stack else blocks

        def starts_block(index):
            line = lines[index].strip()
            return bool(HEADING.match(line) or LIST_ITEM.match(line) or FENCE.match(line) or
                        (index + 1 < len(lines) and '|' in line and table_separator(lines[index + 1])))

        while position < len(lines):
            line = lines[position].strip()
            if not line:
                position += 1
                continue
            heading, fence = HEADING.match(line), FENCE.match(line)
            if fence:
                marker, language = fence.groups()
                code = []
                position += 1
                while position < len(lines) and not re.fullmatch(re.escape(marker[0]) + '{' + str(len(marker)) + r',}\s*', lines[position].strip()):
                    code.append(lines[position])
                    position += 1
                if position == len(lines):
                    raise ValueError('An extraction-rule code fence needs a closing marker.')
                position += 1
                language_class = ' class="language-' + escape(language, quote=True) + '"' if language else ''
                current().append('<pre><code' + language_class + '>' + escape('\n'.join(code) + ('\n' if code else '')) + '</code></pre>')
            elif heading:
                level, title = len(heading[1]), heading[2]
                explicit = EXPLICIT_ID.search(title)
                identifier = explicit[1] if explicit else re.sub(r'\s+', '-', re.sub(r'[^\w\s-]', '', title).strip()).lower()
                if explicit:
                    title = title[:explicit.start()]
                if not identifier:
                    raise ValueError('An extraction-rule heading needs a nonempty identifier.')
                if explicit and identifier in identifiers:
                    raise ValueError('Duplicate extraction-rule heading identifier: ' + identifier)
                base, suffix = identifier, 2
                while identifier in identifiers:
                    identifier = base + '-' + str(suffix)
                    suffix += 1
                identifiers.add(identifier)
                while stack and stack[-1].level >= level:
                    stack.pop()
                section = Section(level, title, identifier)
                current().append(section)
                stack.append(section)
                position += 1
            elif position + 1 < len(lines) and '|' in line and table_separator(lines[position + 1]):
                rows, separator = [table_cells(line)], table_cells(lines[position + 1])
                position += 2
                while position < len(lines) and lines[position].strip() and '|' in lines[position] and not FENCE.match(lines[position].strip()):
                    rows.append(table_cells(lines[position]))
                    position += 1
                current().append(self.table(rows, separator))
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
                    items.append('<li>' + self.inline(item[3]) + '</li>')
                    position += 1
                current().append(f'<{tag}{start}>\n' + '\n'.join(items) + f'\n</{tag}>')
            else:
                paragraph = [line]
                position += 1
                while position < len(lines) and lines[position].strip() and not starts_block(position):
                    paragraph.append(lines[position].strip())
                    position += 1
                current().append('<p>' + self.inline(' '.join(paragraph)) + '</p>')
        content = '\n'.join(block.render(self) if isinstance(block, Section) else block for block in blocks)
        for target in re.findall(r'<a href="#([^"<>]+)"', content):
            if unquote(target) not in identifiers:
                raise ValueError('Extraction-rule link has no matching heading: #' + unquote(target))
        return metadata, content


STYLE = SCHEMA_STYLE + '''
    .extraction-document .policy-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 32px; padding-right: 0; }
    .extraction-downloads { display: grid; gap: 10px; max-width: 440px; }
    .extraction-download-row { display: grid; grid-template-columns: minmax(0, 1fr) 44px; align-items: center; gap: 14px; min-height: 44px; }
    .extraction-download-label { color: #62738a; text-align: right; font-size: 13px; line-height: 1.65; overflow-wrap: anywhere; }
    .extraction-document .policy-header .document-download { position: static; flex-shrink: 0; }
    .extraction-document pre { margin: 18px 0; padding: 18px 20px; overflow-x: auto; border: 1px solid #dfe4eb; border-radius: 8px; background: #f5f8fc; }
    .extraction-document pre code { display: block; padding: 0; background: transparent; font-size: 13px; line-height: 1.8; white-space: pre; overflow-wrap: normal; }
    .extraction-catalog th:first-child { width: 76%; }
    .extraction-catalog th:last-child { width: 24%; }
'''


def download_row(root, path):
    filename = path.name
    title = filename + ' 다운로드'
    return ('<div class="extraction-download-row"><span class="extraction-download-label">' +
            escape(filename) + '</span><a data-document-download href="../' +
            quote(path.relative_to(root).as_posix()) + '" download="' + escape(filename, quote=True) +
            '" class="document-download" title="' + escape(title, quote=True) + '" aria-label="' +
            escape(title, quote=True) + '">' + DOWNLOAD_ICON + '</a></div>')


def document_html(root, source, title, metadata, content):
    details = []
    for key, label in [('version', '버전'), ('created_at', '작성일'), ('updated_at', '수정일')]:
        if value := metadata.get(key):
            if key.endswith('_at') and re.fullmatch(r'\d{4}[-/]\d{2}[-/]\d{2}', value):
                value = value.replace('-', '/')
            details.append('<span>' + label + ' ' + escape(value) + '</span>')
    downloads = [download_row(root, source)]
    return ('<!doctype html>\n' + GENERATED_MARKER + ' Edit docs/extraction-rules Markdown, then run scripts/build_sources.py. -->\n'
            '<html lang="ko">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            '<title>' + escape(title) + '</title>\n<style>' + STYLE + '</style>\n</head>\n<body>\n'
            '<main class="policy-document schema-document extraction-document" data-document-root>\n<header class="policy-header">\n'
            '<div class="extraction-header-main"><div class="policy-kicker">RIST · EXTRACTION RULES</div>\n<h1>' + escape(title) + '</h1>\n'
            '<div class="schema-meta">' + ''.join(details) + '</div></div>\n'
            '<div class="extraction-downloads">' + '\n'.join(downloads) + '</div>\n</header>\n'
            '<div class="policy-sections">\n' + content + '\n</div>\n</main>\n</body>\n</html>\n')


def rule_summary(code):
    return code + ' 파일의 판별·추출·변환 규칙과 컬럼 매핑.'


def build_extraction_rules(root=ROOT):
    root = Path(root).resolve()
    index = root / 'docs' / 'extraction-rules' / 'index.md'
    if not index.is_file() or not inside(index, root / 'docs' / 'extraction-rules'):
        return False
    rules = discover_rules(root)
    index_source = rebuild_index(index.read_text(encoding='utf-8'), rules)
    page_map = {index: 'extraction-rules-index'}
    page_map.update({rule: 'extraction-rule-' + rule.stem for rule in rules})
    schema = root / 'docs' / 'rist-schema.md'
    if schema.is_file() and inside(schema, root / 'docs'):
        page_map[schema] = 'rist-schema'
    pages, documents = [], {}
    for source in [index, *rules]:
        source_text = index_source if source == index else source.read_text(encoding='utf-8')
        metadata, content = Renderer(root, source, page_map).render(source_text)
        title = '인덱스' if source == index else source.stem.upper()
        page_id = page_map[source]
        pages.append({'id': page_id, 'title': title,
                      'summary': 'CSV·EXCEL·PDF 유형별 추출 규칙 목록.' if source == index else rule_summary(title),
                      'src': 'pages/' + page_id + '.html', 'width': 1280, 'autoHeight': True, 'kind': '추출 규칙'})
        documents[root / 'pages' / (page_id + '.html')] = document_html(root, source, title, metadata, content)
    index.write_text(index_source, encoding='utf-8')
    (root / 'pages').mkdir(parents=True, exist_ok=True)
    for path, document in documents.items():
        path.write_text(document, encoding='utf-8')
    for stale in (root / 'pages').glob('extraction-rule-*.html'):
        if stale not in documents and stale.is_file() and GENERATED_MARKER in stale.read_text(encoding='utf-8')[:200]:
            stale.unlink()
    (root / 'data').mkdir(parents=True, exist_ok=True)
    (root / 'data' / 'extraction-rules.js').write_text(
        '// Generated by scripts/build_extraction_rules.py.\nwindow.MOCKUP_VIEWER_EXTRACTION_RULE_PAGES = ' +
        json.dumps(pages, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    return True


if __name__ == '__main__':
    if build_extraction_rules():
        print('Built extraction-rule catalog, pages, and viewer data.')
