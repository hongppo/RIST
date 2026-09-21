import tempfile
from pathlib import Path
import unittest
from build_change_history import build_change_history, render_history


class ChangeHistoryTests(unittest.TestCase):
    def test_page_links_validate_targets_and_escape_labels(self):
        content = render_history('## 2026/09/21\n\n- 대상: [검토 <화면>](#rist-review-detail)\n', {'rist-review-detail'})
        self.assertIn('data-viewer-page="rist-review-detail"', content)
        self.assertIn('검토 &lt;화면&gt;', content)
        with self.assertRaisesRegex(ValueError, 'Unknown history page'):
            render_history('[삭제 화면](#rist-deleted)', {'rist-review-detail'})

    def test_long_history_keeps_all_rows_and_document_root(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'docs').mkdir()
            (root / 'data').mkdir()
            (root / 'data/manifest.js').write_text("{id: 'rist-review-detail'}")
            (root / 'docs/rist-change-history.md').write_text('## 날짜별 개요\n\n| 날짜 | 변경 개요 |\n| --- | --- |\n' + '| 2026/09/21 | 변경 내용 |\n' * 40)
            self.assertTrue(build_change_history(root))
            html = (root / 'pages/rist-change-history.html').read_text()
            self.assertIn('data-document-root', html)
            self.assertEqual(html.count('<td>2026/09/21</td>'), 40)
            self.assertNotIn('overflow:hidden', html)
