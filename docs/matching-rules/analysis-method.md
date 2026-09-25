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

- 파일에서 명확하게 추출한 분석법을 우선한다. 분석물질의 DB 매칭값과 달라도 덮어쓰거나 `NULL`로 바꾸지 않는다.
- 명확한 추출 분석법이 없으면 파일 유형과 관계없이 분석물질 필드의 추출·입력값으로 위 시험방법 코드를 매칭한다. 대응이 없거나 불명확하면 `NULL`로 두고 검토 화면에서 보완한다. 명백한 오타는 대응이 유일할 때만 매칭한다.
- PDF-002 지정악취 22종은 별도 예외로 위 코드를 PDF 기재 여부·개정판 차이와 관계없이 적용한다. 이 예외를 다른 유형에 확대하지 않는다.
- 원문과 출처는 보존하고 DB 매칭값은 파일 추출값과 구분한다. 불명확한 원문은 스냅샷에 보존하되 확정 추출값으로 취급하지 않는다.
- 시험방법 코드는 분석법 ID·고시번호와 구분한다. DB 매칭 시 표시값은 코드와 DB 분석법명을 연결한다. ID는 실제 분석법과 동일한 목록 항목에 연결될 때만 설정하며 다른 분석법의 ID를 붙이지 않는다.

관련 규칙: [PDF-002](<../extraction-rules/pdf/pdf-002.md>) · [매칭 규칙](<index.md>)
