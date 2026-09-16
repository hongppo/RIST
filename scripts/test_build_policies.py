#!/usr/bin/env python3
"""Verify Markdown anchors, safe text rendering and the normal source build."""

import contextlib
import base64
import io
import json
import re
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from build_policies import build_policies, render_markdown
import build_sources


class BuildPoliciesTests(unittest.TestCase):
    def test_metadata_header_preserves_policy_body_and_anchors(self):
        body = '# 정책 문서\n\n소개입니다.\n\n## 로그인 정책 {#login-policy}\n\n로그인 내용입니다.\n\n## 파일 업로드 정책 {#upload-policy}\n\n업로드 내용입니다.\n'
        source = '---\nversion: 1\ncreated_at: 2026-09-16\nupdated_at: 2026-09-17\n---\n\n' + body
        self.assertEqual(render_markdown(source), render_markdown(body))
        with tempfile.TemporaryDirectory(prefix='mockup-policy-metadata-test-') as folder:
            root = Path(folder)
            (root / 'docs').mkdir()
            (root / 'docs' / 'rist-policies.md').write_text(source, encoding='utf-8')
            self.assertTrue(build_policies(root))
            html = (root / 'pages' / 'rist-policies.html').read_text(encoding='utf-8')
        self.assertIn(
            '<h1>정책 문서</h1>\n<div class="policy-meta"><span>버전 1</span>'
            '<span>작성일 2026/09/16</span><span>수정일 2026/09/17</span></div>\n<p>소개입니다.</p>',
            html,
        )
        self.assertIn('id="login-policy" tabindex="-1"', html)
        self.assertIn('id="upload-policy" tabindex="-1"', html)
        self.assertNotIn('created_at:', html)
        with self.assertRaisesRegex(ValueError, 'closing ---'):
            render_markdown('---\nversion: 1\n' + body)

    def test_policy_boundaries_and_stable_ids(self):
        title, intro, content = render_markdown('''# 정책 문서

예시입니다.

## 로그인 정책 {#login-policy}

첫 번째 문단의
다음 줄입니다.

- **로그인**을 확인합니다.
- 두 번째 항목입니다.

### 세부 내용

정책 설명입니다.

## 업로드 정책 {#upload-policy}

다른 정책입니다.
''')
        self.assertEqual(title, '정책 문서')
        self.assertIn('<p>예시입니다.</p>', intro)
        self.assertEqual(content.count('<section '), 2)
        self.assertIn('id="login-policy" tabindex="-1"', content)
        self.assertIn('id="upload-policy" tabindex="-1"', content)
        first, second = content.split('</section>', 1)
        self.assertIn('<p>첫 번째 문단의 다음 줄입니다.</p>', first)
        self.assertIn('<li><strong>로그인</strong>을 확인합니다.</li>', first)
        self.assertIn('<h3>세부 내용</h3>', first)
        self.assertNotIn('다른 정책입니다.', first)
        self.assertIn('다른 정책입니다.', second)

    def test_untrusted_html_is_text_and_invalid_ids_fail(self):
        title, intro, content = render_markdown('''# 정책 <script>

<img src=x onerror=alert(1)>

## 로그인 <b> {#login-policy}

- **<script>alert(1)</script>**
''')
        self.assertEqual(title, '정책 <script>')
        self.assertNotIn('<img', intro)
        self.assertIn('&lt;img', intro)
        self.assertNotIn('<script>', content)
        self.assertNotIn('<b>', content)
        self.assertIn('<strong>&lt;script&gt;alert(1)&lt;/script&gt;</strong>', content)
        for source, error in [
            ('# Title\n## Missing ID\nText', 'use ##'),
            ('# Title\n## Invalid {#Bad}\nText', 'lowercase'),
            ('# Title\n## A {#same}\n## B {#same}', 'duplicate'),
            ('# Title\n# Again', 'one #'),
            ('## Policy {#policy}', '# title'),
        ]:
            with self.subTest(source=source):
                with self.assertRaisesRegex(ValueError, error):
                    render_markdown(source)

    def test_regular_build_regenerates_html_and_registry_from_markdown(self):
        with tempfile.TemporaryDirectory(prefix='mockup-policy-test-') as folder:
            root = Path(folder)
            (root / 'docs').mkdir()
            source = root / 'docs' / 'rist-policies.md'
            first = '# 정책 문서\n\n## 로그인 정책 {#login-policy}\n\n원문 내용입니다.\n'
            source.write_text(first, encoding='utf-8')
            with patch.object(build_sources, 'ROOT', root), contextlib.redirect_stdout(io.StringIO()):
                build_sources.main()
                html_path = root / 'pages' / 'rist-policies.html'
                first_html = html_path.read_text(encoding='utf-8')
                self.assertIn('data-document-root', first_html)
                self.assertIn('height: auto;', first_html)
                self.assertNotIn('min-height:', first_html)
                self.assertIn('원문 내용입니다.', first_html)
                updated = first.replace('원문 내용입니다.', '수정 내용입니다.')
                source.write_text(updated, encoding='utf-8')
                build_sources.main()
            self.assertEqual(source.read_text(encoding='utf-8'), updated)
            final_html = html_path.read_text(encoding='utf-8')
            self.assertIn('수정 내용입니다.', final_html)
            self.assertNotIn('원문 내용입니다.', final_html)
            script = (root / 'data' / 'page-sources.js').read_text(encoding='utf-8')
            registry = json.loads(script.split(' = ', 1)[1].rsplit(';', 1)[0])
            preview_html = registry['pages/rist-policies.html']['html']
            download = re.search(r'href="(data:text/markdown;charset=utf-8;base64,([^"]+))"', preview_html)
            self.assertIsNotNone(download)
            self.assertEqual(base64.b64decode(download[2]), source.read_bytes())
            self.assertEqual(preview_html.replace(download[1], '../docs/rist-policies.md'), final_html)


if __name__ == '__main__':
    unittest.main(verbosity=2)
