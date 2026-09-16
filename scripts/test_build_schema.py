"""Focused coverage for schema fidelity, anchor targets, and HTML escaping."""

from pathlib import Path
import tempfile
import unittest

from build_schema import build_schema, inline, render_markdown


class SchemaRendererTests(unittest.TestCase):
    def test_preserves_document_structure_and_local_targets(self):
        metadata, content = render_markdown('''---
version: 1
created_at: 2026-09-16
client: private metadata
---
## 테이블 목록

| 테이블명 | 한글 이름 | 간단한 설명 | 바로가기 |
| --- | --- | --- | --- |
| `analysis_record` | 분석 기본 기록 | 설명 | [상세](#analysis_record) |

## 테이블별 상세 항목

### analysis_record

**분석 기본 기록** — 설명.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `record_id` | ID | `UUID` | 불가 | PK |

- `record_id` 보존.
- **최초값** 보존.

#### 파일 처리 상태

상태 설명.
''')
        self.assertEqual(metadata, {'version': '1', 'created_at': '2026-09-16'})
        self.assertNotIn('private metadata', content)
        self.assertIn('href="#analysis_record"', content)
        self.assertIn('id="analysis_record" tabindex="-1"', content)
        self.assertIn('<h3>analysis_record</h3>', content)
        self.assertIn('<h4>파일 처리 상태</h4>', content)
        self.assertIn('<strong>분석 기본 기록</strong>', content)
        self.assertIn('<li><code>record_id</code> 보존.</li>', content)
        self.assertEqual(content.count('<table '), 2)
        self.assertEqual(content.count('<section '), content.count('</section>'))

    def test_escapes_source_html_and_disallows_executable_links(self):
        result = inline('<script>alert(1)</script> **<img src=x>** `<b>` [go](javascript:alert(1))')
        self.assertNotIn('<script>', result)
        self.assertNotIn('<img', result)
        self.assertNotIn('<a ', result)
        self.assertIn('<strong>&lt;img src=x&gt;</strong>', result)
        self.assertIn('<code>&lt;b&gt;</code>', result)

    def test_preserves_pipes_inside_cells(self):
        _, content = render_markdown('## 표\n\n| 값 | 설명 |\n| --- | --- |\n| `A|B` | A\\|B |')
        self.assertIn('<code>A|B</code>', content)
        self.assertIn('<td>A|B</td>', content)

    def test_rejects_unresolved_anchor_and_malformed_table(self):
        with self.assertRaisesRegex(ValueError, 'no matching heading'):
            render_markdown('## 목록\n\n[상세](#missing)')
        with self.assertRaisesRegex(ValueError, 'same number of columns'):
            render_markdown('## 표\n\n| A | B |\n| --- | --- |\n| C |')

    def test_build_skips_absent_source_and_renders_metadata(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            self.assertFalse(build_schema(root))
            (root / 'docs').mkdir()
            (root / 'docs' / 'rist-schema.md').write_text('---\nversion: 1\ncreated_at: 2026-09-16\n---\n## 개요\n\n본문.', encoding='utf-8')
            self.assertTrue(build_schema(root))
            document = (root / 'pages' / 'rist-schema.html').read_text(encoding='utf-8')
            self.assertIn('<h1>통합 스키마</h1>', document)
            self.assertIn('data-document-root', document)
            self.assertIn('작성일 2026/09/16', document)
            self.assertNotIn('created_at:', document)


if __name__ == '__main__':
    unittest.main()
