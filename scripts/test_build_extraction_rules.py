"""Extraction catalogs reflect source files; documents keep executable links safe."""

from html import escape
import json
from pathlib import Path
import re
import tempfile
import unittest

from build_extraction_rules import Renderer, build_extraction_rules, discover_rules


FRONTMATTER = '''---
type: planning
hub: "[[문서 목록]]"
created_at: 2026-09-01
updated_at: 2026-09-16
version: 2
---
'''
RULE = '''---
created_at: 2026-09-02
updated_at: 2026-09-15
version: 7
---
## 규칙 개요

| 항목 | 내용 |
| --- | --- |
| 대상 | SIFT-MS CSV의 물질별 농도 구간 |
| 원본 파일명 | `원본 데이터.csv` |
| 기본 항목 매핑 | [통합 스키마](<../../rist-schema.md#review_record>) |
| 물질별 항목 매핑 | [결과](<../../rist-schema.md#review_result>) |
| 규칙 목록 | [추출 규칙](<../index.md#csv>) |
| 샘플 다운로드 | [CSV-001-01.csv](../../../samples/csv/csv-001/CSV-001-01.csv) |

### 컬럼 매핑

| 값 | 설명 |
| --- | --- |
| `A|B` | A\\|B |

- `result_raw` 보존.
- **최초값** 보존.

### 컬럼 매핑

```text
{시료명}_inlet-{YYYYMMDD}.xml: ({단위})
```

```regex
[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?
```
'''


class ExtractionRuleTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.root = Path(self.folder.name)
        self.index = self.root / 'docs' / 'extraction-rules' / 'index.md'

    def tearDown(self):
        self.folder.cleanup()

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, bytes):
            path.write_bytes(content)
        else:
            path.write_text(content, encoding='utf-8')
        return path

    def fixture(self):
        self.write('docs/extraction-rules/index.md', FRONTMATTER + '\n## 오래된 목록\n\n기존 목록.\n')
        self.write('docs/extraction-rules/csv/csv-001.md', RULE)
        self.write('docs/rist-schema.md', '## review_record\n\n## review_result\n')

    def page_data(self):
        data = (self.root / 'data' / 'extraction-rules.js').read_text(encoding='utf-8')
        return json.loads(data.split(' = ', 1)[1].rstrip(';\n'))

    def document(self, name='extraction-rule-csv-001'):
        return (self.root / 'pages' / (name + '.html')).read_text(encoding='utf-8')

    def test_absent_index_is_a_no_op(self):
        self.assertFalse(build_extraction_rules(self.root))
        self.assertEqual(list(self.root.iterdir()), [])

    def test_catalog_is_sorted_from_documents_and_preserves_index_frontmatter(self):
        self.fixture()
        for kind, code in [('pdf', '011'), ('csv', '010'), ('excel', '002'), ('csv', '002'), ('pdf', '002')]:
            self.write(f'docs/extraction-rules/{kind}/{kind}-{code}.md', '## 개요\n\n추출 항목.\n')
        self.write('docs/extraction-rules/csv/notes.md', '## 메모\n')
        self.write('docs/extraction-rules/pdf/csv-009.md', '## 다른 유형\n')
        self.write('samples/pdf/pdf-001/PDF-001-01.pdf', b'%PDF-1.4\n')
        build_extraction_rules(self.root)
        expected = ['csv-001', 'csv-002', 'csv-010', 'excel-002', 'pdf-002', 'pdf-011']
        self.assertEqual([path.stem for path in discover_rules(self.root)], expected)
        pages = self.page_data()
        self.assertEqual([page['id'] for page in pages], ['extraction-rules-index', *['extraction-rule-' + code for code in expected]])
        self.assertEqual([page['title'] for page in pages], ['인덱스', *[code.upper() for code in expected]])
        for page in pages:
            self.assertEqual(page['width'], 1280)
            self.assertIs(page['autoHeight'], True)
            self.assertEqual(page['kind'], '추출 규칙')
            self.assertTrue((self.root / page['src']).is_file())
        index_text = self.index.read_text(encoding='utf-8')
        self.assertTrue(index_text.startswith(FRONTMATTER))
        self.assertEqual(re.findall(r'^## (CSV|EXCEL|PDF)$', index_text, re.M), ['CSV', 'EXCEL', 'PDF'])
        self.assertNotIn('PDF-001', index_text)
        self.assertNotIn('notes', index_text)
        self.assertNotIn('오래된 목록', index_text)
        index_html = self.document('extraction-rules-index')
        self.assertIn('href="extraction-rule-csv-001.html" data-viewer-page="extraction-rule-csv-001"', index_html)
        self.assertIn('href="#csv"', index_html)
        self.assertIn('>index.md</span>', index_html)
        self.assertIn('download="index.md"', index_html)

    def test_metadata_rich_content_and_schema_navigation_are_preserved(self):
        self.fixture()
        build_extraction_rules(self.root)
        document = self.document()
        self.assertIn('<h1>CSV-001</h1>', document)
        self.assertIn('<title>CSV-001</title>', document)
        self.assertIn('<title>인덱스</title>', self.document('extraction-rules-index'))
        for expected in ['버전 7', '작성일 2026/09/02', '수정일 2026/09/15', '>csv-001.md</span>']:
            self.assertIn(expected, document)
        for absent in ['버전 2', 'type: planning', 'created_at:', '추후', '샘플 파일 ·']:
            self.assertNotIn(absent, document)
        self.assertIn('data-document-download href="../docs/extraction-rules/csv/csv-001.md" download="csv-001.md"', document)
        self.assertIn('href="rist-schema.html#review_record" data-viewer-page="rist-schema" data-viewer-anchor="review_record"', document)
        self.assertIn('href="rist-schema.html#review_result" data-viewer-page="rist-schema" data-viewer-anchor="review_result"', document)
        self.assertIn('href="extraction-rules-index.html#csv" data-viewer-page="extraction-rules-index" data-viewer-anchor="csv"', document)
        self.assertIn('<code>A|B</code>', document)
        self.assertIn('<td>A|B</td>', document)
        self.assertIn('<li><strong>최초값</strong> 보존.</li>', document)
        self.assertIn('id="컬럼-매핑"', document)
        self.assertIn('id="컬럼-매핑-2"', document)
        for language, code in re.findall(r'```(text|regex)\n(.*?)\n```', RULE, re.S):
            self.assertIn('<pre><code class="language-' + language + '">' + escape(code + '\n') + '</code></pre>', document)
        self.assertEqual(document.count('<section '), document.count('</section>'))
        self.assertEqual(self.page_data()[1]['summary'], 'CSV-001 파일의 판별·추출·변환 규칙과 컬럼 매핑.')

    def test_sample_files_and_links_stay_excluded_when_sample_folder_reappears(self):
        self.fixture()
        build_extraction_rules(self.root)
        without_samples = self.document()
        samples = ['CSV-001-03.xlsx', 'CSV-001-01.csv', 'CSV-001-02.pdf', 'CSV-001-04.XLS', 'CSV-001-05 (원본).csv']
        for filename in samples:
            self.write('samples/csv/csv-001/' + filename, b'private sample content\r\n')
        self.write('samples/csv/csv-001/README.md', '안내')
        self.write('samples/pdf/pdf-001/PDF-001-01.pdf', b'pdf')
        build_extraction_rules(self.root)
        document = self.document()
        self.assertEqual(document, without_samples)
        for absent in ['data-sample-download', '샘플 파일 ·', '../samples/', 'private sample content',
                       'README.md', 'PDF-001-01', *[name for name in samples if name != 'CSV-001-01.csv']]:
            self.assertNotIn(absent, document)
        self.assertIn('<td>원본 파일명</td><td><code>원본 데이터.csv</code></td>', document)
        self.assertIn('data-document-download href="../docs/extraction-rules/csv/csv-001.md" download="csv-001.md"', document)
        self.assertEqual(document.count(' download='), 1)
        self.assertIn('<td>CSV-001-01.csv</td>', document)  # Preserve an old source label without creating a sample link.
        (self.root / 'samples/csv/csv-001/CSV-001-01.csv').unlink()
        build_extraction_rules(self.root)
        document = self.document()
        self.assertEqual(document, without_samples)

    def test_safe_rendering_blocks_html_traversal_and_unlisted_files(self):
        self.fixture()
        outside = self.write('unrelated/private.md', 'not a document')
        escaping_rule = self.root / 'docs/extraction-rules/csv/csv-099.md'
        escaping_rule.symlink_to(outside)
        self.assertEqual([path.stem for path in discover_rules(self.root)], ['csv-001'])
        sample = self.write('samples/csv/csv-001/CSV-001-01.csv', 'content')
        (sample.parent / 'CSV-001-02.csv').symlink_to(outside)
        renderer = Renderer(self.root, self.root / 'docs/extraction-rules/csv/csv-001.md', {self.index: 'extraction-rules-index'})
        _, content = renderer.render('''## 안전한 본문

<script>alert(1)</script> **<img src=x>** `<b>`

[외부 파일](../../../../../../etc/passwd) [실행](javascript:alert) [누락](../../../samples/csv/csv-001/missing.csv) [차단](%00.csv)

[존재하는 샘플](../../../samples/csv/csv-001/CSV-001-01.csv) [심볼릭 링크](../../../samples/csv/csv-001/CSV-001-02.csv)

```text
<script>code only</script> A|B \\.
```
''')
        self.assertNotIn('<script>', content)
        self.assertNotIn('<img', content)
        self.assertNotIn('<a ', content)
        self.assertIn('<strong>&lt;img src=x&gt;</strong>', content)
        self.assertIn('&lt;script&gt;code only&lt;/script&gt; A|B \\.', content)
        build_extraction_rules(self.root)
        self.assertNotIn('CSV-001-02.csv', self.document())

    def test_rebuild_removes_only_own_stale_pages_and_is_repeatable(self):
        self.fixture()
        extra = self.write('docs/extraction-rules/excel/excel-003.md', '## 규칙\n\n항목.\n')
        build_extraction_rules(self.root)
        manual = self.write('pages/extraction-rule-manual.html', '<p>Keep this file.</p>')
        extra.unlink()
        build_extraction_rules(self.root)
        self.assertFalse((self.root / 'pages/extraction-rule-excel-003.html').exists())
        self.assertTrue(manual.exists())
        before = {path: path.read_bytes() for path in [self.index, self.root / 'data/extraction-rules.js', self.root / 'pages/extraction-rule-csv-001.html']}
        build_extraction_rules(self.root)
        self.assertEqual(before, {path: path.read_bytes() for path in before})


if __name__ == '__main__':
    unittest.main()
