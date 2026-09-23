---
type: planning
hub: "[[💡planning]]"
created_at: 2026-09-23
updated_at: 2026-09-23
client: "[[RIST(포항산업과학연구원)]]"
project: "[[RIST 데이터 표준화 프로그램 개발]]"
status: 초안
version: 2
---

## 변경 이력

| 수정일 | 변경항목 | 변경내용 |
| --- | --- | --- |
| 2026/09/23 | 최초 작성·문서 정리 | 회신 목록 8건과 원본 시트·셀 범위를 정리. 원본 값·공란을 보존하고 개요의 중복 문서 상태 안내 제거 |

## 문서 개요

| 항목 | 내용 |
| --- | --- |
| 목록명 | 분석 기관 |
| 원본 파일 | RIST_목록_정리_양식_20260922_1차_rist.xlsx |
| 원본 시트 | 분석 기관 |
| 원본 표 | InstitutionList (B5:E35) |
| 데이터 건수 | 8건 |
| 대상 테이블 | institution_master |

## 컬럼 설명

| 컬럼명 | 한글 이름 | 설명 |
| --- | --- | --- |
| `institution_name_ko` | 기관명(한글) | 원문 값 유지. 미제공 값은 공란. |
| `institution_name_en` | 기관명(영문) | 원문 값 유지. 미제공 값은 공란. |
| `abbreviation` | 약칭 | 원문 값 유지. 미제공 값은 공란. |
| `description` | 비고 | 원문 값 유지. 미제공 값은 공란. |

## 데이터 목록

| `institution_name_ko` | `institution_name_en` | `abbreviation` | `description` |
| --- | --- | --- | --- |
| 포항산업과학연구원 분석평가센터 | Research institute of Industrial Science and Technology | RIST | 분석평가센터 |
| 포항산업과학연구원 환경연구소 | Research institute of Industrial Science and Technology | RIST | 환경연구소 |
| 한국기초과학지원연구원 | Korea Basic Science Institute | KBSI |  |
| 한국산업기술시험원 | Korea Testing Laboratory | KTL |  |
| 한국분석시험연구원 | Korea Analysis Test Researcher | KATR |  |
| 한국화학융합시험연구원 | Korea Testing & Research Institute | KTR |  |
| FITI시험연구원 | FITI Testing & Research Institute | FITI |  |
| 태성환경연구소 |  | TEASUNG |  |

## 보존 기준

| 항목 | 대상 | 처리 |
| --- | --- | --- |
| 동일 영문명·약칭 | 분석평가센터 / 환경연구소 | 동일 RIST 약칭·영문명을 사용하지만 별도 회신 행이므로 두 행 모두 유지 |

[DB 리스트로 돌아가기](<index.md>)
