#!/usr/bin/env python3
"""Fixture-based regression tests; never read or modify the viewer's pages."""

import contextlib
import base64
import importlib.util
import io
import json
import re
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location(
    'viewer_build_sources', Path(__file__).with_name('build_sources.py')
)
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


class BuildSourcesTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory(prefix='mockup-source-test-')
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name).resolve()
        self.pages = self.root / 'pages'
        self.pages.mkdir()
        self.root_patch = patch.object(builder, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def page(self, content, css='', head=''):
        path = self.pages / 'example.html'
        path.write_text(
            '<!doctype html><html lang="ko"><head><title>Example</title>'
            + head + '<style>' + css + '</style></head><body>'
            + content + '</body></html>', encoding='utf-8'
        )
        return path

    def test_full_page_inlines_relative_styles_and_assets(self):
        assets = self.pages / 'assets'
        assets.mkdir()
        # Distinct byte content makes incorrect paths or unresolved assets visible.
        (assets / 'pixel.png').write_bytes(b'fixture-image-payload')
        (assets / 'card.css').write_text(
            '.card{background-image:url("pixel.png");color:#123456}',
            encoding='utf-8'
        )
        self.page(
            '<section class="card" data-component="sample-card" '
            'data-component-title="카드"><img src="assets/pixel.png">'
            '<p>Fixture content</p></section>',
            head='<link rel="stylesheet" href="assets/card.css">'
        )
        with contextlib.redirect_stdout(io.StringIO()):
            builder.main()
        script = (self.root / 'data' / 'page-sources.js').read_text(encoding='utf-8')
        registry = json.loads(script.split(' = ', 1)[1].rsplit(';', 1)[0])
        page = registry['pages/example.html']
        self.assertNotIn('<link ', page['html'])
        self.assertEqual(page['html'].count('data:image/png;base64,'), 2)
        self.assertIn('Fixture content', page['html'])
        self.assertIn('data-component="sample-card"', page['html'])
        self.assertEqual(len(page['components']), 1)
        component = page['components'][0]
        self.assertNotIn('data-component', component['html'])
        self.assertIn('data:image/png;base64,', component['html'])
        self.assertIn('data:image/png;base64,', component['css'])

    def test_component_preserves_local_styles_without_canvas_geometry(self):
        path = self.page(
            '<article class="card" data-component="profile" '
            'data-component-title="프로필" data-component-width="320">'
            '<span class="label">Alice</span></article>',
            css='''
                html,body{width:999px;height:888px;overflow:hidden;
                  padding:50px;font-family:"Fixture Sans",sans-serif;color:navy;
                  --accent:teal}
                body{font-size:17px;line-height:1.6}
                *{box-sizing:border-box}
                .card .label{color:var(--accent)}
                .card:hover::before{content:"{quoted}"}
                @media (max-width:600px){.card .label{font-size:14px}}
            '''
        )
        component = builder.build_page(path)['components'][0]
        scope = '.mockup-component--' + component['id']
        rules = list(builder.css_blocks(component['css']))
        root_properties = {}
        for selector, declarations in rules:
            if selector == scope:
                for declaration in declarations.split(';'):
                    name, separator, value = declaration.partition(':')
                    if separator:
                        root_properties[name.strip()] = value.strip()
        self.assertEqual(root_properties['width'], '320px')
        for name in ('height', 'overflow', 'padding'):
            self.assertNotIn(name, root_properties)
        self.assertEqual(root_properties['font-family'], '"Fixture Sans",sans-serif')
        self.assertEqual(root_properties['font-size'], '17px')
        self.assertEqual(root_properties['--accent'], 'teal')
        self.assertIn(scope + ' .card .label', dict(rules))
        self.assertIn(scope + ' .card:hover::before', dict(rules))
        media = next(body for selector, body in rules if selector.startswith('@media'))
        self.assertTrue(all(selector.startswith(scope + ' ') for selector, _ in builder.css_blocks(media)))

    def test_document_download_embeds_exact_markdown_bytes_and_rebuilds(self):
        docs = self.root / 'docs'
        docs.mkdir()
        markdown = docs / 'policy.md'
        path = self.page('<main data-document-root><a data-document-download href="../docs/policy.md" download="정책 문서.md">MD</a></main>')
        for payload in [b'---\r\nversion: 1\r\n---\r\n' + '한글 정책'.encode(), '수정된 정책\n'.encode()]:
            markdown.write_bytes(payload)
            html = builder.build_page(path)['html']
            embedded = re.search(r'href="data:text/markdown;charset=utf-8;base64,([^"]+)"', html)
            self.assertIsNotNone(embedded)
            self.assertEqual(base64.b64decode(embedded[1]), payload)
            self.assertIn('download="정책 문서.md"', html)
            self.assertNotIn(str(self.root), html)

    def test_document_download_rejects_remote_and_outside_docs_paths(self):
        for href in ['https://example.invalid/policy.md', '../../outside.md', '../assets/policy.md', '../docs/file.html']:
            with self.subTest(href=href), self.assertRaisesRegex(ValueError, 'local Markdown'):
                builder.build_page(self.page('<a data-document-download href="' + href + '" download="정책 문서.md">MD</a>'))

    def test_sample_download_embeds_each_supported_type_with_exact_bytes(self):
        samples = self.root / 'samples'
        samples.mkdir()
        fixtures = {
            '.csv': ('text/csv', b'\xef\xbb\xbf' + '시료,값\r\nA,3.50\r\n'.encode()),
            '.pdf': ('application/pdf', b'%PDF-1.7\r\n\x00\xff\x10\x80 sample bytes\r\n%%EOF'),
            '.xlsx': ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', b'PK\x03\x04\x00\xff\x10\x80 workbook bytes'),
            '.xls': ('application/vnd.ms-excel', b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1\x00\xff workbook bytes'),
        }
        for extension, (mime, payload) in fixtures.items():
            with self.subTest(extension=extension):
                sample = samples / ('원본 예시' + extension)
                sample.write_bytes(payload)
                filename = '분석 샘플' + extension
                path = self.page('<main data-document-root><a data-sample-download href="../samples/원본%20예시' + extension + '" download="' + filename + '">샘플</a></main>')
                for original in [payload, payload + b'\r\nupdated\x00']:
                    sample.write_bytes(original)
                    html = builder.build_page(path)['html']
                    embedded = re.search(r'href="data:([^;]+);base64,([^"]*)"', html)
                    self.assertIsNotNone(embedded)
                    self.assertEqual(embedded[1], mime)
                    self.assertEqual(base64.b64decode(embedded[2], validate=True), original)
                    self.assertIn('download="' + filename + '"', html)
                    self.assertNotIn(str(self.root), html)

    def test_sample_download_rejects_remote_traversal_and_unsupported_sources(self):
        for href in [
            'https://example.invalid/data.csv', '//example.invalid/data.csv',
            'file:///private/data.csv', 'data:text/csv;base64,YSxi',
            '../../outside.csv', '../samples/../../outside.csv', '../samples/%2e%2e/docs/data.csv',
            '../assets/data.csv', '../samples/data.csv?raw=1', '../samples/data.csv#section',
            '../samples/data.md', '../samples/data.html', '../samples/data.exe',
            '../samples/data.csv%00', '../samples\\data.csv', '',
        ]:
            with self.subTest(href=href), self.assertRaisesRegex(ValueError, 'local CSV, PDF, XLSX or XLS'):
                builder.build_page(self.page('<a data-sample-download href="' + href + '" download="샘플.csv">샘플</a>'))

    def test_sample_download_rejects_symlinks_outside_samples(self):
        samples = self.root / 'samples'
        samples.mkdir()
        outside = self.root / 'private.csv'
        outside.write_bytes(b'private fixture')
        (samples / 'link.csv').symlink_to(outside)
        with self.assertRaisesRegex(ValueError, 'local CSV, PDF, XLSX or XLS'):
            builder.build_page(self.page('<a data-sample-download href="../samples/link.csv" download="샘플.csv">샘플</a>'))

    def test_sample_download_requires_a_plain_filename_matching_the_source_extension(self):
        samples = self.root / 'samples'
        samples.mkdir()
        (samples / 'data.csv').write_bytes(b'fixture\r\n')
        for filename in ['', 'sample', '.csv', 'sample.pdf', 'sample.csv.exe', '../sample.csv', 'folder\\sample.csv', 'sample\x7f.csv']:
            with self.subTest(filename=filename), self.assertRaisesRegex(ValueError, 'plain filename matching'):
                builder.build_page(self.page('<a data-sample-download href="../samples/data.csv" download="' + filename + '">샘플</a>'))

    def test_sample_download_rejects_a_samples_directory_symlink_to_another_folder(self):
        docs = self.root / 'docs'
        docs.mkdir()
        (docs / 'data.csv').write_bytes(b'private fixture')
        (self.root / 'samples').symlink_to(docs, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'local CSV, PDF, XLSX or XLS'):
            builder.build_page(self.page('<a data-sample-download href="../samples/data.csv" download="샘플.csv">샘플</a>'))

    def test_main_builds_extraction_rules_before_collecting_sources(self):
        def extraction_rules(root):
            self.assertEqual(root, self.root)
            self.page('<main data-document-root>Generated extraction rules</main>')

        with patch.object(builder, 'build_extraction_rules', side_effect=extraction_rules) as build_rules:
            with contextlib.redirect_stdout(io.StringIO()):
                builder.main()
        build_rules.assert_called_once_with(self.root)
        script = (self.root / 'data' / 'page-sources.js').read_text(encoding='utf-8')
        registry = json.loads(script.split(' = ', 1)[1].rsplit(';', 1)[0])
        self.assertIn('Generated extraction rules', registry['pages/example.html']['html'])

    def test_invalid_sources_fail_with_actionable_errors(self):
        card = '<section data-component="card" data-component-title="Card"></section>'
        fixtures = [
            ('duplicate ID', card + card, '', '', 'unique'),
            ('unsupported CSS', card, '@keyframes fade{from{opacity:0}to{opacity:1}}', '', 'does not support'),
            ('remote stylesheet', card, '', '<link rel="stylesheet" href="https://example.invalid/style.css">', 'must be local'),
            ('remote image', card + '<img src="https://example.invalid/image.png">', '', '', 'local assets'),
            ('remote CSS asset', card, '.card{background:url(https://example.invalid/image.png)}', '', 'local assets'),
        ]
        for label, html, css, head, error in fixtures:
            with self.subTest(label=label):
                with self.assertRaisesRegex(ValueError, error):
                    builder.build_page(self.page(html, css, head))


if __name__ == '__main__':
    unittest.main(verbosity=2)
