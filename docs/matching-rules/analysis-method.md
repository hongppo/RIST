---
type: planning
hub: "[[💡planning]]"
created_at: 2026-09-25
updated_at: 2026-09-25
client: "[[RIST(포항산업과학연구원)]]"
project: "[[RIST 데이터 표준화 프로그램 개발]]"
status: 초안
version: 1
---

## 변경 이력

| 수정일 | 변경 항목 | 변경 내용 |
| --- | --- | --- |
| 2026/09/25 | 최초 작성 |  |

## 데이터

| 분석물질 | 시험방법 코드 |
| --- | --- |
| Hydrogen sulfide | `ES 09303.3b` |
| Methylmercaptan | `ES 09303.3b` |
| DMS | `ES 09303.3b` |
| DMDS | `ES 09303.3b` |
| Acetaldehyde | `ES 09305.1b` |
| Propionaldehyde | `ES 09305.1b` |
| Butyraldehyde | `ES 09305.1b` |
| Isovaleraldehyde | `ES 09305.1b` |
| Valeraldehyde | `ES 09305.1b` |
| Styrene | `ES 09306.1b` |
| Trimethylamine | `ES 09304.2b` |
| Ammonia | `ES 09302.1b` |
| Toluene | `ES 09307.b` |
| Xylene | `ES 09307.b` |
| MEK | `ES 09307.b` |
| MIBK | `ES 09307.b` |
| Butylacetate | `ES 09307.b` |
| Propionic acid | `ES 09308.2b` |
| Butyric acid | `ES 09308.2b` |
| Isovaleric acid | `ES 09308.2b` |
| Valeric acid | `ES 09308.2b` |
| Isobutylalcohol | `ES 09307.b` |

분석법명·목록: [분석법 DB](<../db-lists/analysis-method.md>)

## 매칭 조건

- 파일 유형과 관계없이 분석물질 필드에 추출되거나 입력된 데이터를 기준으로 해당 시험방법 코드를 매칭한다.
- 명백한 오타는 대응이 유일할 때만 매칭한다. 대응이 없거나 불명확하면 `NULL`로 두고 검토 화면에서 보완한다.
- 위 코드는 PDF 기재 여부·개정판 차이와 관계없이 적용하고, PDF 원문과 구분한 매칭값으로 기록한다.
- 시험방법 코드는 분석법 ID·고시번호와 구분한다. 분석법 표시값은 코드와 DB 분석법명을 연결하며, 실제 목록 연결이 확인될 때만 ID를 설정한다.

관련 규칙: [PDF-002](<../extraction-rules/pdf/pdf-002.md>) · [매칭 규칙](<index.md>)
