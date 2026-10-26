---
type: planning
created_at: 2026-10-26
updated_at: 2026-10-26
status: 예정
version: v0.1
---

## 3차 변경 사항

| 변경 항목 | 변경 개요 | 상세 보기 |
| --- | --- | --- |
| 채취일자와 위치의 선택 입력 | 채취일자, 위도, 경도를 선택 입력으로 변경. 두 날짜가 모두 입력된 경우 기존 선후관계 검사 유지 | [필수 항목 및 검사 시점 정책](rist-policies.md#required-fields-policy) |
| CSV-003 추출 규칙 추가 | 시료 열과 분석물질 행으로 구성된 CSV. 순번 열 유무에 따른 두 배치를 지원하고 원문 정밀도 유지 | [CSV-003](<extraction-rules/csv/csv-003.md>) |
| EXCEL-004 추출 규칙 추가 | 대기종합오염도 관리 양식 XLSX. 첫 시트 제외, 시트별 최종 농도 추출, 보조열 제외와 가변 열 배치 지원 | [EXCEL-004](<extraction-rules/excel/excel-004.md>) |
| 임시 저장 정책 | 미완료 작업은 마지막 실제 값 변경 적용일(변경 없으면 업로드일)부터 30일간 운영 서버에 보관. 업로드 이력에서 검토 재개, 만료 시 원본과 검토 데이터 삭제, 미완료 원본 NAS 이관 제외 | [저장 및 원본 다운로드 정책](<rist-storage-original-download-policy.md>) |
