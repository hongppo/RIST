#!/usr/bin/env python3
"""Build the change history using the existing Markdown document renderer."""
from html import escape
from pathlib import Path
import re

from build_schema import STYLE, render_markdown

ROOT = Path(__file__).resolve().parent.parent
PAGE_LINK = re.compile(r"\[([^\]\n]+)\]\(#(rist-[a-z0-9-]+)\)")
TOKEN_PREFIX = "RISTHISTORYPAGELINKTOKEN"


def render_history(source, page_ids):
    # Viewer page links are separate from document-local heading anchors.
    if TOKEN_PREFIX in source:
        raise ValueError("Reserved history link token in source")
    links = {}

    def page_link(match):
        label, identifier = match.groups()
        if identifier not in page_ids:
            raise ValueError("Unknown history page link: " + identifier)
        token = TOKEN_PREFIX + str(len(links)) + "END"
        links[token] = ('<a href="../index.html#' + identifier + '" data-viewer-page="' +
                        identifier + '">' + escape(label) + '</a>')
        return token

    _, content = render_markdown(PAGE_LINK.sub(page_link, source))
    for token, link in links.items():
        content = content.replace(token, link)
    return content


def build_change_history(root=ROOT):
    root = Path(root)
    source = root / 'docs/rist-change-history.md'
    if not source.is_file():
        return False
    manifest = (root / 'data/manifest.js').read_text(encoding='utf-8')
    page_ids = set(re.findall(r"id:\s*['\"](rist-[a-z0-9-]+)['\"]", manifest))
    content = render_history(source.read_text(encoding='utf-8'), page_ids)
    style = STYLE + "\n.history-document { min-height: 800px; } .history-document .schema-reference th:first-child { width: 18%; }"
    document = ('<!doctype html>\n<!-- Generated from docs/rist-change-history.md. Edit Markdown, then run scripts/build_sources.py. -->\n'
                '<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'
                '<title>변경 히스토리</title><style>' + style + '</style></head><body>'
                '<main class="policy-document schema-document history-document" data-document-root>'
                '<header class="policy-header"><h1>변경 히스토리</h1></header>'
                '<div class="policy-sections">' + content + '</div></main></body></html>\n')
    output = root / 'pages/rist-change-history.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(document, encoding='utf-8')
    return True


if __name__ == '__main__':
    build_change_history()
