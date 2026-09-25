import base64
import json
from pathlib import Path
import re
import tempfile
import unittest
from unittest.mock import patch
from build_matching_rules import build_matching_rules, DOCUMENTS as MATCHING
from build_db_lists import build_db_lists, DOCUMENTS as LISTS
import build_sources

class ListDocumentTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        for folder,entries in [('matching-rules',MATCHING),('db-lists',LISTS)]:
            directory=self.root/'docs'/folder;directory.mkdir(parents=True)
            for item in entries:
                (directory/(item[0]+'.md')).write_text('---\nversion: 1\ncreated_at: 2026-09-23\nupdated_at: 2026-09-23\n---\n\n## 변경 이력\n\n| 수정일 | 내용 |\n| --- | --- |\n| 2026/09/23 | 최초 작성 |\n\n## 목록\n\n| 원문 | 값 |\n| --- | --- |\n| 미확정 | 36.123456789012 |\n',encoding='utf-8')
        self.match=self.root/'docs/matching-rules/location.md'
        with self.match.open('a') as f:f.write('\n[지점](<../db-lists/location.md>)\n[매칭](<index.md>)\n')
        self.db=self.root/'docs/db-lists/location.md'
        with self.db.open('a') as f:f.write('\n[목록](<index.md>)\n')

    def test_catalogs_links_history_and_downloads(self):
        before={p:p.read_bytes() for p in (self.root/'docs').rglob('*.md')}
        self.assertTrue(build_matching_rules(self.root));self.assertTrue(build_db_lists(self.root))
        for name,count in [('matching-rules',3),('db-lists',10)]:
            raw=(self.root/'data'/(name+'.js')).read_text();pages=json.loads(raw.split(' = ',1)[1].rstrip().removesuffix(';'))
            self.assertEqual(len(pages),count)
            for page in pages:
                self.assertTrue(page['autoHeight']);self.assertEqual(page['width'],1280)
                html=(self.root/page['src']).read_text()
                self.assertLess(html.index('>변경 이력</h2>'),html.index('>목록</h2>'))
                self.assertIn('data-document-root',html)
        html=(self.root/'pages/rist-matching-location.html').read_text()
        self.assertIn('data-viewer-page="rist-db-list-location"',html)
        self.assertIn('data-viewer-page="rist-matching-index"',html)
        self.assertIn('download="지역 매칭.md"',html)
        self.assertIn('data-viewer-page="rist-db-lists-index"',(self.root/'pages/rist-db-list-location.html').read_text())
        with patch.object(build_sources,'ROOT',self.root):
            embedded=build_sources.build_page(self.root/'pages/rist-matching-location.html')['html']
        payload=re.search('data:text/markdown;charset=utf-8;base64,([^" ]+)',embedded)[1]
        self.assertEqual(base64.b64decode(payload),self.match.read_bytes())
        for p,data in before.items():self.assertEqual(p.read_bytes(),data)

    def test_list_and_matching_links_open_extraction_rule_anchor(self):
        rule = self.root / 'docs/extraction-rules/pdf/pdf-002.md'
        rule.parent.mkdir(parents=True)
        rule.write_text('## 분석법 매칭 가이드 {#analysis-method-matching-guide}\n', encoding='utf-8')
        for source in [self.db, self.match]:
            with source.open('a', encoding='utf-8') as stream:
                stream.write('\n[PDF-002](<../extraction-rules/pdf/pdf-002.md#analysis-method-matching-guide>)\n')
        build_db_lists(self.root)
        build_matching_rules(self.root)
        for page in ['rist-db-list-location', 'rist-matching-location']:
            html = (self.root / 'pages' / (page + '.html')).read_text()
            self.assertIn('data-viewer-page="extraction-rule-pdf-002"', html)
            self.assertIn('data-viewer-anchor="analysis-method-matching-guide"', html)

    def test_db_missing_source_does_not_write_partial_pages(self):
        (self.root/'docs/db-lists/unit.md').unlink()
        with self.assertRaises(ValueError):build_db_lists(self.root)
        self.assertFalse((self.root/'pages').exists())

if __name__=='__main__': unittest.main()
