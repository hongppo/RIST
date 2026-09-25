---
type: planning
hub: "[[💡planning]]"
created_at: 2026-09-23
updated_at: 2026-09-25
client: "[[RIST(포항산업과학연구원)]]"
project: "[[RIST 데이터 표준화 프로그램 개발]]"
status: 초안
version: 2
---

## 변경 이력

| 수정일 | 변경항목 | 변경내용 |
| --- | --- | --- |
| 2026/09/25 | 오타 수정 | Hyodrogen sulfide → Hydrogen sulfide, Isocaleric acid → Isovaleric acid |
| 2026/09/23 | 최초 작성·문서 정리 | 회신 목록 13건과 원본 시트·셀 범위를 정리. 원본 값·공란을 보존하고 개요의 중복 문서 상태 안내 제거 |

## 문서 개요

| 항목 | 내용 |
| --- | --- |
| 목록명 | 분석법 |
| 원본 파일 | RIST_목록_정리_양식_20260922_1차_rist.xlsx |
| 원본 시트 | 분석법 |
| 원본 표 | AnalysisMethodList (B5:F18) |
| 데이터 건수 | 13건 |
| 대상 테이블 | analysis_method_master |

## 컬럼 설명

| 컬럼명 | 한글 이름 | 설명 |
| --- | --- | --- |
| `notice_number` | 고시번호 | 원문 값 유지. 미제공 값은 공란. |
| `test_method_code` | 시험방법 코드 | 원문 값 유지. 미제공 값은 공란. |
| `method_name_ko` | 한글명 | 원문 값 유지. 미제공 값은 공란. |
| `method_name_en` | 영문명 | 원문 값 유지. 미제공 값은 공란. |
| `description` | 설명·적용 조건 | 명확한 파일 추출 분석법 우선, 없을 때 분석물질 매칭으로 보완. PDF-002는 별도 예외 적용. |

## 데이터 목록

| `notice_number` | `test_method_code` | `method_name_ko` | `method_name_en` | `description` |
| --- | --- | --- | --- | --- |
|  | ES 01804.2a | 환경대기 중 유해 휘발성 유기화합물(VOCs) 시험방법 - 고체흡착법 |  | 대기/VOCs |
|  | ES 01803.1 | 환경대기 중 알데하이드류 - 고성능액체크로마토그래피법 |  | 대기/Aldehyde |
|  | SIFT-MS | 이동질량분석측정 |  | 악취 |
|  | ES 09301.d | 공기희석관능법 |  | 악취 |
|  | ES 09303.3b | 황화합물 - 전기냉각 저온농축 - 모세관 컬럼 - 기체크로마토그래피 |  | 악취/Hydrogen sulfide, Methylmercaptan, DMS, DMDS |
|  | ES 09305.1b | 알데하이드 - DNPH 카트리지 - 액체크로마토그래피 |  | 악취/Acetaldehyde, Propionaldehyde, Butyraldehyde, Isovaleraldehyde, Valeraldehyde |
|  | ES 09306.1b | 스타이렌 - 저온 농축 - 기체크로마토그래피 |  | 악취/Styrene |
|  | ES 09304.2b | 트라이메틸아민 - 고체상 미량추출 - 기체크로마토그래피 |  | 악취/Trimethylamine |
|  | ES 09302.1b | 암모니아 - 붕산용액 흡수법 - 자외선/가시선 분광법 |  | 악취/Ammonia |
|  | ES 09307.b | 휘발성유기화합물 - 저온 농축 - 기체크로마토그래피 |  | 악취/Toluene, Xylene, MEK, MIBK, Butylacetate |
|  | ES 09308.2b | 지방산류 - 고체상 미량추출 - 기체크로마토그래피 |  | 악취/Propionic acid, Butyric acid, Isovaleric acid, Valeric acid |
|  | ES 09307.b | 휘발성유기화합물 - 저온 농축 - 기체크로마토그래피 |  | 악취/Isobutylalcohol |
|  |  | 자체시험법 |  |  |

- 고시번호 공란을 시험방법 코드로 채우지 않음. 확인된 영문 철자는 교정한 값을 사용.

명확한 파일 추출 분석법을 우선하며, 없을 때 분석물질 필드에 추출되거나 입력된 데이터를 기준으로 [분석법 매칭](<../matching-rules/analysis-method.md>)을 적용한다. DB 보완 시 대응이 없거나 불명확하면 `NULL`로 두고 검토 화면에서 보완한다. PDF-002 지정악취 22종은 별도로 정한 DB 매칭 우선 예외를 따른다.

[DB 리스트로 돌아가기](<index.md>)
