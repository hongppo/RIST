---
type: planning
hub: "[[💡planning]]"
created_at: 2026-09-16
updated_at: 2026-09-18
client: "[[RIST(포항산업과학연구원)]]"
project: "[[RIST 데이터 표준화 프로그램 개발]]"
status: 초안
version: 1
---

## 문서 개요

| 항목 | 내용 |
| --- | --- |
| 목적 | 환경데이터 표준화 프로그램의 데이터 저장 구조 정의 |
| 구성 | 17개 논리 테이블의 컬럼·관계·제약 조건 |

## 테이블 목록

| 테이블명 | 한글 이름 | 간단한 설명 | 바로가기 |
| --- | --- | --- | --- |
| `analysis_record` | 분석 기본 기록 | 최종 저장한 시료·담당자·기관·일자·분석 기간·좌표 | [상세](#analysis_record) |
| `analysis_result` | 물질별 분석 결과 | 분석 기록별 물질·BASE·방법·결과·단위 | [상세](#analysis_result) |
| `uploaded_file` | 업로드 파일 | 원본 파일·업로더·처리 상태·적용 규칙·이력 | [상세](#uploaded_file) |
| `review_work` | 데이터 검토 작업 | 작업 상태·버전·저장 기준점 | [상세](#review_work) |
| `review_record` | 검토 중 분석 기본 기록 | 최종 저장 전 기본 항목의 추출값·입력값·수정값 | [상세](#review_record) |
| `review_result` | 검토 중 물질별 결과 | 최종 저장 전 물질별 추출값·수정값·검증 상태 | [상세](#review_result) |
| `user_account` | 회원 | 사용자 이름·역할·계정 상태 | [상세](#user_account) |
| `user_identity` | 회원 인증 정보 | 인증 제공자별 회원 식별 정보 | [상세](#user_identity) |
| `location_master` | 지역·관측 지점 목록 | 반복 사용하는 지점명·위경도 | [상세](#location_master) |
| `substance_master` | 분석 물질 목록 | 물질명·CAS 번호·물질 식별 | [상세](#substance_master) |
| `base_master` | BASE 목록 | BASE 선택·매칭 기준 | [상세](#base_master) |
| `sampling_method_master` | 채취법 목록 | 채취 방법 명칭·적용 조건 | [상세](#sampling_method_master) |
| `analysis_method_master` | 분석법 목록 | 분석법 명칭·고시번호·방법 코드 | [상세](#analysis_method_master) |
| `substance_method_map` | 물질별 방법·추천 매핑 | 물질·매체별 BASE·방법 조합·추천 순위 | [상세](#substance_method_map) |
| `common_option` | 공통 선택 항목 | 구분·매체·담당자·기관·단위의 그룹별 목록 | [상세](#common_option) |
| `file_type_master` | 파일 유형 목록 | 유형 코드·명칭·사용 여부·현재 적용 버전 | [상세](#file_type_master) |
| `file_type_rule_version` | 유형별 추출 규칙 버전 | 판별·추출·입력 명세·실행 스크립트·변경 이력 | [상세](#file_type_rule_version) |

## 테이블별 상세 항목

### 공통 표기·저장 기준

| 항목 | 기준 |
| --- | --- |
| 스키마 수준 | DBMS 미지정의 논리 스키마 |
| ID | UUID 자동 발급. 검토 기록·결과의 ID를 최종 테이블에도 재사용 |
| NULL | 값이 없으면 SQL NULL. 빈 값의 안내 문구나 문자열 `NULL`로 대체하지 않음 |
| 업무 필수값 | 표의 NULL은 저장 구조의 허용 여부. 최종 저장 시 해당 유형의 input_schema로 필수값·허용 조합을 추가 검증 |
| 숫자 | 정밀 소수형 사용. 좌표는 아래 자릿수 규칙 적용. 그 외 DECIMAL의 정밀도·소수 자릿수는 원본 최대 범위로 확정. 임의 반올림·절삭 금지 |
| 시스템 시각 | TIMESTAMP WITH TIME ZONE. UTC 저장 |
| 분석 일시 | 원본의 날짜·시각·정밀도 보존. 실제 시각이 없는 날짜를 00:00으로 만들지 않음 |
| 좌표 | 십진수 도 단위의 위도·경도. 지도용 WGS 84를 저장 기준으로 제안하며, 다른 원본 좌표계는 유형별 변환 명세 필요 |
| 좌표 자릿수 | 위도·경도 모두 `DECIMAL(13,10)`. 전체 13자리 중 소수부 10자리, 정수부 최대 3자리. analysis_record·review_record·location_master에 동일 적용 |
| 십진수 좌표 입력 | 소수점 10자리 이하는 값 변경 없이 저장. 10자리를 초과하면 저장 전에 정밀도 초과를 검증하고 DB의 자동 반올림·절삭에 맡기지 않음. 파일 원문은 source_snapshot에 보존 |
| 도분초 좌표 변환 | 십진수 변환 결과는 소수점 11번째 자리에서 반올림하여 10자리로 저장. 절댓값 기준 5 이상은 올리고 부호 유지. 파일의 도분초 원문은 source_snapshot에 보존 |
| 보존 | 최초 추출값과 최종값을 분리. 목록 ID와 저장 당시 명칭·값을 함께 보존 |
| 참조 정합성 | 목록에 연결된 표시값을 직접 수정하면 기존 ID를 재검증. 연결이 유효하지 않으면 ID만 NULL로 해제하고 수정값은 보존 |
| 최종 데이터 | 같은 파일의 analysis_record·analysis_result와 최종 상태를 하나의 트랜잭션으로 저장 |

### 주요 관계

| 관계 | 연결 |
| --- | --- |
| 회원 → 업로드 | user_account 1 : N uploaded_file |
| 회원 → 인증 정보 | user_account 1 : N user_identity |
| 업로드 → 검토 작업 | uploaded_file 1 : 0-1 review_work |
| 검토 작업 → 기본 기록 → 결과 | review_work 1 : N review_record 1 : N review_result |
| 업로드 → 최종 기본 기록 → 결과 | uploaded_file 1 : N analysis_record 1 : N analysis_result |
| 파일 유형 → 규칙 버전 | file_type_master 1 : N file_type_rule_version |
| 물질 → 방법·추천 조합 | substance_master 1 : N substance_method_map |

### 공통 데이터 표현

| 저장 항목 | 내용·기준 |
| --- | --- |
| source_snapshot | 필드별 최초 추출 문자열·해석값·원본 위치. 정밀 숫자는 JSON에서도 문자열로 보존. 값이 없는 필드도 추출 여부 구분 |
| field_meta.was_extracted | 최초 파일 추출 여부. 값 변경 후에도 최초 추출 여부 유지 |
| field_meta.value_source | 현재 값의 출처: EXTRACTED / MANUAL / MATCHED / SYSTEM |
| field_meta.input_mode | LIST / DIRECT / DATE_TIME / COORDINATE / SYSTEM. 값의 입력 방식 코드 |
| field_meta.is_modified | 최초 추출값 대비 현재 값의 변경 여부 |
| field_meta.match_status | MATCHED: 목록 연결, UNRESOLVED: 값은 있으나 미연결, EMPTY: 값 없음, NOT_REQUIRED: 목록 참조 대상 아님 |
| validation_issues | 필드명·오류 코드·수준·안내의 목록. 필수값 오류·형식 오류와 단순 미입력 안내 구분 |
| checkpoint_values | 마지막 작업 저장 시점의 업무값·목록 ID·field_meta. 원본 스냅샷은 별도 불변 보존. 복원 시 검증 결과 재계산 |

- field_meta와 source_snapshot은 **컬럼명별 객체**로 저장. 검토·최종 테이블에 동일한 필드 상태 정의 적용.
- 추출값이 타입·범위에 맞지 않으면 최초 문자열과 오류를 보존하고, 유효한 업무값이 확정되기 전까지 해당 타입 컬럼은 NULL 허용.
- 목록 미선택이어도 직접 입력값·추출값이 있으면 보존. 목록 ID 미연결만으로 표시값을 NULL로 덮어쓰지 않음.
- 직접 입력값과 기준 목록은 별도 저장. 추천 순위는 값의 유효성을 의미하지 않음.
- 회원·기준 목록의 참조 행은 삭제 대신 비활성화. 업무 데이터의 회원·지점·물질·방법 연결이 삭제로 끊어지지 않게 처리.

### analysis_record

**분석 기본 기록** — 최종 저장한 기본 정보.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `record_id` | 분석 기록 ID | `UUID` | 불가 | PK. 검토 기록과 같은 ID |
| `file_id` | 업로드 파일 ID | `UUID` | 불가 | FK → uploaded_file.file_id |
| `record_order` | 파일 내 기록 순서 | `INTEGER` | 불가 | 1 이상. 파일 내 원본 기록 순서 |
| `created_by` | 등록 회원 ID | `UUID` | 불가 | FK → user_account.user_id. 업로드 회원 |
| `category_option_id` | 구분 목록 ID | `UUID` | 허용 | FK → common_option.option_id. CATEGORY 그룹 |
| `category` | 구분 | `TEXT` | 허용 | 추출·직접 입력·선택한 명칭 보존 |
| `medium_option_id` | 매체 목록 ID | `UUID` | 허용 | FK → common_option.option_id. MEDIUM 그룹 |
| `medium` | 매체 | `TEXT` | 허용 | 추출·직접 입력·선택한 명칭 보존 |
| `sample_name` | 시료명 | `TEXT` | 허용 | 시료의 표시 이름. 식별키로 사용하지 않음 |
| `person_option_id` | 담당자 목록 ID | `UUID` | 허용 | FK → common_option.option_id. PERSON 그룹 |
| `person_in_charge` | 담당자 | `TEXT` | 허용 | 분석 업무 담당자. 로그인 회원과 별개 |
| `institution_option_id` | 분석 기관 목록 ID | `UUID` | 허용 | FK → common_option.option_id. INSTITUTION 그룹 |
| `analysis_institution` | 분석 기관 | `TEXT` | 허용 | 선택하거나 직접 입력한 기관명 |
| `collected_date` | 채취 날짜 | `DATE` | 허용 | 날짜 부분. 날짜만 확인되어도 저장 |
| `collected_at` | 채취 일시 | `TIMESTAMP` | 허용 | 실제 시각이 확인된 경우에만 저장 |
| `collected_precision` | 채취 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analyzed_date` | 분석 날짜 | `DATE` | 허용 | 분석 시작 날짜 |
| `analyzed_at` | 분석 일시 | `TIMESTAMP` | 허용 | 분석 시작 시각이 확인된 경우에만 저장 |
| `analyzed_precision` | 분석 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analysis_duration_days` | 분석 기간 | `INTEGER` | 허용 | 일 단위, 1 이상. 시작일만 있으면 1일 |
| `location_id` | 등록 지점 ID | `UUID` | 허용 | FK → location_master.location_id. 파일 추출·직접 좌표는 미연결 가능 |
| `location_name` | 등록 지점명 | `TEXT` | 허용 | 지역 선택 시 해당 시점 명칭 보존 |
| `latitude` | 위도 | `DECIMAL(13,10)` | 허용 | -90 이상 90 이하. 측정 당시 좌표 |
| `longitude` | 경도 | `DECIMAL(13,10)` | 허용 | -180 이상 180 이하. 측정 당시 좌표 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `extracted_at` | 추출 완료 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | uploaded_file.extracted_at과 일치 |
| `created_at` | 최종 등록 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 파일 전체 최종 저장 시 기록 |

- 저장 단위: 시료·측정의 분석 기록 1건. 시료명이 같아도 시각·위치가 다르면 별도 기록.
- `record_id`는 review_record의 ID를 재사용하되 검토 테이블에 대한 FK는 두지 않음. `created_by`는 업로드 회원, person_in_charge는 업무 담당자.
- `UNIQUE(file_id, record_order)`. file_id 단독 UNIQUE는 적용하지 않음. 같은 파일에 여러 기록 연결.
- 날짜만 있으면 *_date만 저장하고 *_at은 NULL. 일시가 있으면 두 날짜 부분을 일치시키며 정밀도 보존.
- 위경도는 함께 NULL이거나 함께 유효한 값. 등록 지점 수정 시 기존 측정 좌표·지점명을 자동 변경하지 않음.

### analysis_result

**물질별 분석 결과** — 최종 저장한 물질별 결과.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `result_id` | 분석 결과 ID | `UUID` | 불가 | PK. 검토 결과와 같은 ID |
| `record_id` | 분석 기록 ID | `UUID` | 불가 | FK → analysis_record.record_id |
| `result_order` | 기록 내 결과 순서 | `INTEGER` | 불가 | 1 이상 |
| `substance_id` | 분석 물질 ID | `UUID` | 허용 | FK → substance_master.substance_id. 미매칭 시 NULL |
| `substance_name` | 분석 물질명 | `TEXT` | 허용 | 추출·수정·직접 입력한 이름. CAS 포함 표기 보존 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → base_master.base_id |
| `base_name` | BASE 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → sampling_method_master.sampling_method_id |
| `sampling_method_name` | 채취법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → analysis_method_master.analysis_method_id |
| `analysis_method_name` | 분석법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `analysis_method_code` | 분석법 코드 | `TEXT` | 허용 | 선택 당시 고시번호·코드 보존 |
| `result_text` | 결과 표시값 | `TEXT` | 허용 | 검토한 최종 문자열. 비수치·부등호 표기 포함 |
| `result_value` | 숫자 결과 | `DECIMAL` | 허용 | result_text가 수치로 확정되는 경우만 저장 |
| `result_raw` | 결과 원문 | `TEXT` | 허용 | 파일에서 추출한 최초 결과 문자열. 수정 불가 |
| `unit_option_id` | 단위 목록 ID | `UUID` | 허용 | FK → common_option.option_id. UNIT 그룹 |
| `unit` | 단위 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출·직접 입력한 표기 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `created_at` | 최종 등록 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 파일 전체 최종 저장 시 기록 |

- 저장 단위: 분석 기록에 속한 물질별 결과 1건. 같은 물질의 반복 측정도 별도 결과로 보존.
- `result_id`는 review_result에서 발급한 값을 최종 저장 시 그대로 사용. review_result에 대한 FK는 두지 않음.
- `UNIQUE(record_id, result_order)`. 물질명·물질 ID를 결과의 고유키로 사용하지 않음.
- 목록 ID가 NULL이어도 직접 입력한 명칭·코드·단위는 유지. 필수 연결 여부는 유형 규칙으로 검증.
- result_raw와 source_snapshot은 최초 값. 사용자 수정은 result_text·result_value에 반영. 비수치를 0으로 대체하지 않음.

### uploaded_file

**업로드 파일** — 파일 접수부터 최종 저장까지의 기준.

| 컬럼명                       | 한글 이름       | 자료형                        | NULL | 제약·설명                                                   |
| ------------------------- | ----------- | -------------------------- | ---- | ------------------------------------------------------- |
| `file_id`                 | 파일 ID       | `UUID`                     | 불가   | PK. 업로드마다 새로 발급                                         |
| `uploaded_by`             | 업로드 회원 ID   | `UUID`                     | 불가   | FK → user_account.user_id                               |
| `original_file_name`      | 원본 파일명      | `TEXT`                     | 불가   | 사용자 파일명. 중복 허용                                          |
| `uploaded_file_name`      | 서버 저장 파일명   | `TEXT`                     | 불가   | UNIQUE. 서버가 생성한 파일명                                     |
| `storage_key`             | 원본 저장 위치    | `TEXT`                     | 불가   | UNIQUE. 파일 저장소 경로·객체 키                                  |
| `extension`               | 확장자         | `TEXT`                     | 불가   | csv / pdf / xlsx. 소문자로 정규화                              |
| `file_size_bytes`         | 파일 크기       | `BIGINT`                   | 불가   | 0 초과. 업로드 정책의 20MB 상한 적용                                |
| `storage_status`          | 원본 보관 상태    | `TEXT`                     | 불가   | AVAILABLE / EXPIRED / MISSING                           |
| `processing_status`       | 파일 처리 상태    | `TEXT`                     | 불가   | 접수·분류·추출·검토·최종 저장·종료 상태                                 |
| `file_type`               | 파일 유형       | `TEXT`                     | 허용   | FK → file_type_master.file_type. 판별 전·판별 불가 시 NULL      |
| `applied_rule_version_id` | 적용 규칙 버전 ID | `UUID`                     | 허용   | FK → file_type_rule_version.rule_version_id. 작업에 고정한 버전 |
| `execution_id`            | 현재 추출 실행 ID | `UUID`                     | 허용   | 실행 응답 식별. 과거 응답의 덮어쓰기 방지                                |
| `uploaded_at`             | 접수 완료 시각    | `TIMESTAMP WITH TIME ZONE` | 불가   | 원본 접수 시 서버 기록                                           |
| `extracted_at`            | 추출 완료 시각    | `TIMESTAMP WITH TIME ZONE` | 허용   | 채택한 추출이 완료된 시각                                          |
| `saved_at`                | 최종 저장 완료 시각 | `TIMESTAMP WITH TIME ZONE` | 허용   | 작업 저장 시각과 구분. 최종 저장 전 NULL                              |
| `saved_by`                | 최종 저장 회원 ID | `UUID`                     | 허용   | FK → user_account.user_id. uploaded_by와 일치              |
| `saved_record_count`      | 최종 기본 기록 수  | `INTEGER`                  | 불가   | 기본값 0. 실제 저장 건수                                         |
| `saved_result_count`      | 최종 물질 결과 수  | `INTEGER`                  | 불가   | 기본값 0. 실제 저장 건수                                         |
| `last_error`              | 마지막 처리 오류   | `JSON`                     | 허용   | 단계·오류 코드·메시지·발생 시각                                      |
| `updated_at`              | 최종 상태 변경 시각 | `TIMESTAMP WITH TIME ZONE` | 불가   | 서버 기록                                                   |

- 한 파일의 작업 저장과 최종 저장은 같은 file_id를 유지. 같은 파일을 다시 업로드하면 새 file_id 발급.
- 유형 미확정 시 file_type·applied_rule_version_id는 NULL이며 최종 분석 기록은 없음.
- file_type과 적용 버전의 file_type은 일치. 작업에 연결한 적용 버전은 불변.
- file_id별 최종 저장은 중복 불가. SAVED 상태에서는 saved_at·saved_by와 실제 최종 기록·결과 건수가 일치.

#### 파일 처리 상태

| 코드 | 의미 |
| --- | --- |
| RECEIVED | 파일 접수 완료 |
| DETECTING | 파일 유형 확인 중 |
| TYPE_UNSUPPORTED | 등록 규칙에 맞는 유형 없음·종료 |
| EXTRACTING | 데이터 추출 중 |
| REVIEWING | 사전 준비·상세 검토 중. 작업 저장 이후에도 유지 |
| EXTRACTION_FAILED | 추출 실패 |
| SAVING | 파일 전체 최종 저장 중 |
| SAVED | 최종 저장 완료 |
| SAVE_FAILED | 최종 저장 실패 |
| CANCELED | 작업 취소 |
| EXPIRED | 작업 만료 |

### review_work

**데이터 검토 작업** — 파일별 검토 상태와 작업 데이터 버전.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `work_id` | 검토 작업 ID | `UUID` | 불가 | PK |
| `file_id` | 파일 ID | `UUID` | 불가 | FK → uploaded_file.file_id. UNIQUE |
| `user_id` | 작업 회원 ID | `UUID` | 불가 | FK → user_account.user_id. 업로드 회원과 일치 |
| `current_stage` | 현재 검토 단계 | `TEXT` | 불가 | PREPARATION: 사전 준비 / DETAIL: 상세 검토 |
| `work_status` | 검토 작업 상태 | `TEXT` | 불가 | REVIEWING / FINALIZING / FINALIZED / CANCELED / EXPIRED |
| `revision` | 현재 작업 버전 | `BIGINT` | 불가 | 0부터 단조 증가. 데이터 변경·복원 시 증가 |
| `saved_revision` | 작업 저장 기준 버전 | `BIGINT` | 허용 | 마지막 작업 저장이 성공한 revision. 최초 저장 전 NULL |
| `work_saved_at` | 작업 저장 시각 | `TIMESTAMP WITH TIME ZONE` | 허용 | 마지막 작업 저장 완료 시각 |
| `work_saved_by` | 작업 저장 회원 ID | `UUID` | 허용 | FK → user_account.user_id |
| `validated_revision` | 전체 검증 완료 버전 | `BIGINT` | 허용 | 전체 필수값·형식 검증을 통과한 revision. 변경 시 무효화 |
| `last_edited_by` | 최근 편집 회원 ID | `UUID` | 허용 | FK → user_account.user_id |
| `created_at` | 작업 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 추출 결과로 검토 작업 생성 |
| `updated_at` | 작업 변경 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `expires_at` | 작업 만료 시각 | `TIMESTAMP WITH TIME ZONE` | 허용 | 작업 보관 정책 적용 시 설정 |

- 파일당 review_work는 최대 1건. 모든 검토 단계가 같은 work_id와 데이터를 참조.
- revision을 기준으로 동시 변경을 제어. 변경·복원 시 revision은 증가하고 validated_revision은 무효화.
- 작업 저장 시 전체 검토 행의 checkpoint_values와 saved_revision·work_saved_at·work_saved_by를 하나의 트랜잭션으로 갱신. 실패 시 기존 저장 기준점 유지.
- 최종 데이터는 필수값·형식 검증을 통과한 동일 revision에서 생성. 기록·결과가 0건이거나 미해결 오류가 있으면 최종 저장 불가.
- analysis_record·analysis_result 생성과 파일 SAVED·작업 FINALIZED 상태는 같은 트랜잭션으로 확정. 일부 데이터만 남는 최종 저장은 허용하지 않음.

### review_record

**검토 중 분석 기본 기록** — 최종 저장 전 기본 항목.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `record_id` | 검토 기본 기록 ID | `UUID` | 불가 | PK. 추출 결과 수신 시 발급, 최종 기록에 재사용 |
| `work_id` | 검토 작업 ID | `UUID` | 불가 | FK → review_work.work_id |
| `record_order` | 파일 내 기록 순서 | `INTEGER` | 불가 | 1 이상. UNIQUE(work_id, record_order) |
| `category_option_id` | 구분 목록 ID | `UUID` | 허용 | FK → common_option.option_id. CATEGORY 그룹 |
| `category` | 구분 | `TEXT` | 허용 | 추출·직접 입력·선택한 명칭 보존 |
| `medium_option_id` | 매체 목록 ID | `UUID` | 허용 | FK → common_option.option_id. MEDIUM 그룹 |
| `medium` | 매체 | `TEXT` | 허용 | 추출·직접 입력·선택한 명칭 보존 |
| `sample_name` | 시료명 | `TEXT` | 허용 | 시료의 표시 이름. 식별키로 사용하지 않음 |
| `person_option_id` | 담당자 목록 ID | `UUID` | 허용 | FK → common_option.option_id. PERSON 그룹 |
| `person_in_charge` | 담당자 | `TEXT` | 허용 | 분석 업무 담당자. 로그인 회원과 별개 |
| `institution_option_id` | 분석 기관 목록 ID | `UUID` | 허용 | FK → common_option.option_id. INSTITUTION 그룹 |
| `analysis_institution` | 분석 기관 | `TEXT` | 허용 | 선택하거나 직접 입력한 기관명 |
| `collected_date` | 채취 날짜 | `DATE` | 허용 | 날짜 부분. 날짜만 확인되어도 저장 |
| `collected_at` | 채취 일시 | `TIMESTAMP` | 허용 | 실제 시각이 확인된 경우에만 저장 |
| `collected_precision` | 채취 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analyzed_date` | 분석 날짜 | `DATE` | 허용 | 분석 시작 날짜 |
| `analyzed_at` | 분석 일시 | `TIMESTAMP` | 허용 | 분석 시작 시각이 확인된 경우에만 저장 |
| `analyzed_precision` | 분석 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analysis_duration_days` | 분석 기간 | `INTEGER` | 허용 | 일 단위, 1 이상. 시작일만 있으면 1일 |
| `location_id` | 등록 지점 ID | `UUID` | 허용 | FK → location_master.location_id. 파일 추출·직접 좌표는 미연결 가능 |
| `location_name` | 등록 지점명 | `TEXT` | 허용 | 지역 선택 시 해당 시점 명칭 보존 |
| `latitude` | 위도 | `DECIMAL(13,10)` | 허용 | -90 이상 90 이하. 측정 당시 좌표 |
| `longitude` | 경도 | `DECIMAL(13,10)` | 허용 | -180 이상 180 이하. 측정 당시 좌표 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `validation_issues` | 필드 검증 결과 | `JSON` | 불가 | 오류 코드·대상 필드·수준·안내. 오류가 없으면 빈 목록 |
| `checkpoint_values` | 작업 저장값 | `JSON` | 허용 | 마지막 명시적 작업 저장의 업무값·목록 ID·field_meta. 최초 저장 전 NULL |
| `updated_by` | 최근 변경 회원 ID | `UUID` | 허용 | FK → user_account.user_id |
| `created_at` | 검토 행 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 추출 결과의 행 생성 시 기록 |
| `updated_at` | 검토 행 변경 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |

- 업무 컬럼은 analysis_record와 같은 의미·형식. 누락·미확정 값은 NULL로 두고 최초 문자열과 오류는 별도 보존.
- 구분부터 경도까지의 기본 항목은 record_id 단위로 저장. 하위 review_result에 기본 항목을 중복 저장하지 않음.
- source_snapshot은 불변. field_meta는 초기 추출 여부와 현재 입력 방식·수정 여부를 구분.
- checkpoint_values는 업무값과 연결 ID·필드 상태를 함께 저장. 복원 시 validation_issues를 재검증하고 validated_revision을 무효화.
- 작업 저장·최종 저장의 데이터 범위는 동일 work_id에 속한 전체 기록과 결과.

### review_result

**검토 중 물질별 결과** — 최종 저장 전 물질 항목.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `result_id` | 검토 물질 결과 ID | `UUID` | 불가 | PK. 추출 결과 수신 시 발급, 최종 결과에 재사용 |
| `record_id` | 검토 기본 기록 ID | `UUID` | 불가 | FK → review_record.record_id |
| `result_order` | 기록 내 결과 순서 | `INTEGER` | 불가 | 1 이상. UNIQUE(record_id, result_order) |
| `substance_id` | 분석 물질 ID | `UUID` | 허용 | FK → substance_master.substance_id. 미매칭 시 NULL |
| `substance_name` | 분석 물질명 | `TEXT` | 허용 | 추출·수정·직접 입력한 이름. CAS 포함 표기 보존 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → base_master.base_id |
| `base_name` | BASE 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → sampling_method_master.sampling_method_id |
| `sampling_method_name` | 채취법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → analysis_method_master.analysis_method_id |
| `analysis_method_name` | 분석법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 직접 입력값 |
| `analysis_method_code` | 분석법 코드 | `TEXT` | 허용 | 선택 당시 고시번호·코드 보존 |
| `result_text` | 결과 표시값 | `TEXT` | 허용 | 검토한 최종 문자열. 비수치·부등호 표기 포함 |
| `result_value` | 숫자 결과 | `DECIMAL` | 허용 | result_text가 수치로 확정되는 경우만 저장 |
| `result_raw` | 결과 원문 | `TEXT` | 허용 | 파일에서 추출한 최초 결과 문자열. 수정 불가 |
| `unit_option_id` | 단위 목록 ID | `UUID` | 허용 | FK → common_option.option_id. UNIT 그룹 |
| `unit` | 단위 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출·직접 입력한 표기 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `validation_issues` | 필드 검증 결과 | `JSON` | 불가 | 오류 코드·대상 필드·수준·안내. 오류가 없으면 빈 목록 |
| `checkpoint_values` | 작업 저장값 | `JSON` | 허용 | 마지막 명시적 작업 저장의 업무값·목록 ID·field_meta. 최초 저장 전 NULL |
| `updated_by` | 최근 변경 회원 ID | `UUID` | 허용 | FK → user_account.user_id |
| `created_at` | 검토 행 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 추출 결과의 행 생성 시 기록 |
| `updated_at` | 검토 행 변경 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |

- 작업 소속은 부모 review_record.work_id로 결정. 별도 work_id 컬럼 없이 부모 관계로 참조.
- 분석 물질·BASE·채취법·분석법·결과·단위는 result_id 단위로 저장.
- result_raw와 source_snapshot은 최초 추출값. 검토 수정은 현재 표시값과 수치값에만 반영.
- checkpoint_values는 업무값·목록 ID·field_meta를 함께 보관하고 복원 시 재검증.
- 파일 내 결과 순서는 부모 record_order와 result_order의 조합으로 결정.

### user_account

**회원** — 사용자 이름·권한·계정 상태.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `user_id` | 회원 ID | `UUID` | 불가 | PK. 인증 방식 변경 후에도 유지 |
| `display_name` | 사용자 이름 | `TEXT` | 불가 | 회원의 사용자 이름 |
| `role_code` | 권한 | `TEXT` | 불가 | `USER`: 일반 회원 / `ADMIN`: 관리자 |
| `status` | 계정 상태 | `TEXT` | 불가 | `ACTIVE`, `INACTIVE` |
| `created_at` | 생성 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 최초 생성 시각 |
| `updated_at` | 수정 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 마지막 변경 시각 |

- 로그인 회원과 분석 기록의 담당자는 별개입니다. 업로드·저장 행위자는 `user_id`로 연결합니다.
- 계정 상태가 `INACTIVE`여도 기존 업로드·저장 기록의 회원 참조는 유지.

### user_identity

**회원 인증 정보** — 회원별 인증 제공자·식별자·비밀번호 해시.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `identity_id` | 인증 정보 ID | `UUID` | 불가 | PK |
| `user_id` | 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `provider_kind` | 인증 방식 | `TEXT` | 불가 | `LOCAL`, `SSO` |
| `provider_key` | 인증 제공자 식별자 | `TEXT` | 불가 | 자체 인증 제공자 또는 SSO 발급자를 구분하는 고정 식별자 |
| `provider_subject` | 제공자 내 사용자 식별자 | `TEXT` | 불가 | 자체 로그인 ID 또는 SSO의 변경되지 않는 사용자 식별자 |
| `password_hash` | 비밀번호 해시 | `TEXT` | 허용 | `LOCAL`은 필수, `SSO`는 NULL. 평문 비밀번호 저장 금지 |
| `is_active` | 인증 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 최초 연결 시각 |
| `updated_at` | 수정 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 마지막 변경 시각 |

- `(provider_key, provider_subject)`는 고유하며, 회원별 `LOCAL` 인증 정보는 최대 1개입니다.
- 자체 로그인 ID는 등록·조회 시 동일한 정규화 기준을 적용합니다. SSO 식별자는 제공자의 식별 규칙을 유지합니다.
- 하나의 user_id에 여러 인증 정보를 연결할 수 있으며, 인증 방식과 관계없이 user_id 유지.

### location_master

**지역·관측 지점 목록** — 지역·관측 지점명과 기준 좌표.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `location_id` | 지역·관측 지점 ID | `UUID` | 불가 | PK |
| `location_name` | 지역·관측 지점명 | `TEXT` | 불가 | 지역·관측 지점의 명칭 |
| `latitude` | 위도 | `DECIMAL(13,10)` | 불가 | WGS 84 좌표. `-90 ≤ 값 ≤ 90` |
| `longitude` | 경도 | `DECIMAL(13,10)` | 불가 | WGS 84 좌표. `-180 ≤ 값 ≤ 180` |
| `description` | 위치 설명 | `TEXT` | 허용 | 지점 구분을 위한 설명 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_by` | 등록 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `updated_by` | 수정 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `created_at` | 생성 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 최초 등록 시각 |
| `updated_at` | 수정 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 마지막 변경 시각 |

- 위도·경도는 모두 필수이며 WGS 84 범위 제약 적용.
- 선택한 지점의 좌표는 분석 기록에 복사하여 보존합니다. 지점 정보 변경이 기존 기록의 좌표를 자동 변경하지 않습니다.
- 파일에서 추출한 좌표는 분석 기록별로 보존. 지점 참조 없이 location_id가 NULL인 기록도 허용.
- 지역·관측 지점명은 고유 키로 사용하지 않습니다. 동일 명칭의 지점은 위치 설명과 좌표로 구분합니다.
- 검토 중 좌표를 직접 수정해 선택한 지점과 달라지면 기록의 location_id·location_name을 해제하고 수정 좌표를 유지합니다. 최초 위치 정보는 source_snapshot에 보존합니다.

### substance_master

분석 물질의 식별 정보와 선택·매칭 기준을 관리합니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `substance_id` | 분석 물질 ID | `UUID` | 불가 | PK |
| `substance_name` | 물질명 | `TEXT` | 불가 | 공백만 있는 값 불가. 표준 표시명 |
| `cas_number` | CAS 번호 | `TEXT` | 허용 | 값이 있는 경우 UNIQUE |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- substance_name에는 UNIQUE를 적용하지 않으며, substance_id로 물질 식별.
- 결과의 표시값은 기록에 보존하며, 목록에서 선택·확정한 경우 물질 ID를 연결합니다.
- 참조 중인 항목은 삭제 대신 비활성화합니다.

### base_master

BASE의 표시명과 선택·매칭 목록을 관리합니다.

| 컬럼명           | 한글 이름        | 자료형                        | NULL | 제약·설명                                           |
| ------------- | ------------ | -------------------------- | ---- | ----------------------------------------------- |
| `base_id`     | BASE ID      | `UUID`                     | 불가   | PK                                              |
| `base_name`   | BASE 이름      | `TEXT`                     | 불가   | 공백만 있는 값 불가                                     |
| `description` | 설명           | `TEXT`                     | 허용   | 항목의 의미·적용 조건                                    |
| `is_active`   | 사용 여부        | `BOOLEAN`                  | 불가   | 기본값 `true`                                      |
| `created_at`  | 생성 시각        | `TIMESTAMP WITH TIME ZONE` | 불가   | 서버 기록                                           |
| `created_by`  | 생성 사용자 ID    | `UUID`                     | 허용   | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at`  | 최종 수정 시각     | `TIMESTAMP WITH TIME ZONE` | 불가   | 생성 시각으로 초기화, 변경 시 갱신                            |
| `updated_by`  | 최종 수정 사용자 ID | `UUID`                     | 허용   | FK → `user_account.user_id`                     |

- 직접 입력값은 결과에 보존하며, 입력만으로 목록에 자동 등록하지 않습니다.
- 참조 중인 항목은 삭제 대신 비활성화합니다.

### sampling_method_master

시료 채취 방법의 명칭과 선택 목록을 관리합니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `sampling_method_id` | 채취법 ID | `UUID` | 불가 | PK |
| `method_name` | 채취법 이름 | `TEXT` | 불가 | 공백만 있는 값 불가 |
| `description` | 설명 | `TEXT` | 허용 | 적용 조건·구분 정보 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- method_name에는 UNIQUE를 적용하지 않으며, sampling_method_id로 채취법 식별.
- 직접 입력값은 결과에 보존하며, 입력만으로 목록에 자동 등록하지 않습니다.
- 참조 중인 항목은 삭제 대신 비활성화합니다.

### analysis_method_master

분석법의 명칭·코드와 선택 목록을 관리합니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `analysis_method_id` | 분석법 ID | `UUID` | 불가 | PK |
| `method_code` | 분석법 코드 | `TEXT` | 허용 | 고시번호·방법 코드. 명칭과 함께 식별 |
| `method_name` | 분석법 이름 | `TEXT` | 불가 | 공백만 있는 값 불가 |
| `description` | 설명 | `TEXT` | 허용 | 적용 조건·코드 발급 기준 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- method_name·method_code 각각에 전역 UNIQUE를 적용하지 않으며, analysis_method_id로 분석법 식별.
- 직접 입력값은 결과에 보존하며, 입력만으로 목록에 자동 등록하지 않습니다.
- 참조 중인 항목은 삭제 대신 비활성화합니다.

### substance_method_map

물질·매체별 BASE·채취법·분석법의 적용 조합과 추천 순서를 관리합니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `mapping_id` | 매핑 ID | `UUID` | 불가 | PK |
| `substance_id` | 분석 물질 ID | `UUID` | 불가 | FK → `substance_master.substance_id` |
| `medium_option_id` | 매체 항목 ID | `UUID` | 허용 | FK → `common_option.option_id`. `MEDIUM` 그룹만 허용. NULL은 매체 제한 없음 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → `base_master.base_id` |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → `sampling_method_master.sampling_method_id` |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → `analysis_method_master.analysis_method_id` |
| `recommendation_rank` | 추천 순위 | `INTEGER` | 불가 | 0 이상. 낮을수록 우선순위 높음 |
| `match_conditions` | 추가 적용 조건 | `JSON` | 허용 | 조건 명세 버전과 허용된 조건 항목만 저장. NULL은 추가 조건 없음 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- `base_id`·`sampling_method_id`·`analysis_method_id` 중 하나 이상 필수입니다. 여러 값이 있으면 하나의 적용 조합으로 관리합니다.
- 적용 조건은 물질·매체·match_conditions로 정의. recommendation_rank는 적용 가능한 조합의 우선순위.
- 동일 물질·매체·방법 조합·정규화한 추가 조건의 중복을 금지합니다. 이때 NULL끼리는 동일한 값으로 비교하며, DBMS에 맞는 제약 또는 트랜잭션 검증을 적용합니다.
- 물질·매체 등 조건 변경 시 연결된 BASE·방법 조합의 유효성을 재검증. 유효하지 않은 참조는 공통 참조 정합성 기준 적용.

### common_option

구분·매체·담당자·분석 기관·단위의 그룹별 선택 목록을 관리합니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `option_id` | 항목 ID | `UUID` | 불가 | PK |
| `option_group` | 항목 그룹 | `TEXT` | 불가 | `CATEGORY`·`MEDIUM`·`PERSON`·`INSTITUTION`·`UNIT` |
| `option_code` | 항목 코드 | `TEXT` | 불가 | 그룹 내 고정 식별 코드. UNIQUE(`option_group`, `option_code`) |
| `option_name` | 항목 이름 | `TEXT` | 불가 | 항목 명칭. 공백만 있는 값 불가 |
| `display_order` | 기본 표시 순서 | `INTEGER` | 불가 | 기본값 0, 0 이상. 낮을수록 먼저 표시 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- 그룹 의미: `CATEGORY` 구분, `MEDIUM` 매체, `PERSON` 담당자, `INSTITUTION` 분석 기관, `UNIT` 단위. 담당자 목록과 로그인 회원은 별개입니다.
- 참조 필드별 허용 그룹을 검증합니다. 이름에 전역 UNIQUE를 적용하지 않으며, 코드는 참조 후 변경하지 않습니다.
- 참조 ID와 추출·직접 입력값이 모두 없으면 해당 업무 컬럼은 NULL.
- 직접 입력값을 자동 등록하지 않으며, 기록 당시 표시값은 기록에 보존합니다. 참조 중인 항목은 삭제 대신 비활성화합니다.

### file_type_master

**파일 유형 목록** — 유형 코드·사용 여부·현재 적용할 추출 규칙 버전 관리.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `file_type` | 파일 유형 코드 | `TEXT` | 불가 | PK. 등록 후 변경하지 않는 유형 식별자 |
| `type_name` | 파일 유형명 | `TEXT` | 불가 | 유형의 명칭 |
| `description` | 유형 설명 | `TEXT` | 허용 | 파일 구조·용도 설명 |
| `allowed_extensions` | 허용 확장자 | `JSON` | 불가 | `csv`, `pdf`, `xlsx` 중 해당 유형에서 허용하는 확장자 배열 |
| `current_rule_version_id` | 현재 적용 규칙 버전 ID | `UUID` | 허용 | FK → `file_type_rule_version.rule_version_id`. 적용 준비 전에는 NULL |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 신규 작업의 자동 분류·적용 여부 |
| `updated_by` | 수정 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `updated_at` | 수정 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 마지막 변경 시각 |

- allowed_extensions는 해당 유형의 허용 확장자 배열. 판별 명세는 연결된 규칙 버전의 detection_spec에 저장.
- 현재 적용 버전은 동일한 `file_type`에 속하며, 실행 가능한 스크립트 배포가 완료된 버전이어야 합니다.
- 적용 가능한 유형 조건: is_active = true, current_rule_version_id가 배포 완료된 버전을 참조.
- 유형 상태·현재 적용 버전 변경 시 기존 uploaded_file.applied_rule_version_id는 유지.

### file_type_rule_version

**유형별 추출 규칙 버전** — 판별·추출·필드 명세와 실행 스크립트의 버전별 참조.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `rule_version_id` | 규칙 버전 ID | `UUID` | 불가 | PK |
| `file_type` | 파일 유형 코드 | `TEXT` | 불가 | FK → `file_type_master.file_type` |
| `version_label` | 버전명 | `TEXT` | 불가 | `(file_type, version_label)` 고유 |
| `detection_spec` | 유형 판별 명세 | `JSON` | 불가 | 파일 구조·헤더·필수 항목 등 자동 분류 기준 |
| `extraction_spec` | 데이터 추출 명세 | `JSON` | 불가 | 원본 항목과 저장 항목의 매핑·변환·물질별 행 생성 기준 |
| `input_schema` | 입력·검토 항목 명세 | `JSON` | 불가 | 필드 범위·순서·출처·입력 방식·검증·편집 범위 |
| `parser_key` | 추출 스크립트 식별자 | `TEXT` | 불가 | 실행할 스크립트의 고정 식별자 |
| `parser_version` | 추출 스크립트 버전 | `TEXT` | 불가 | 해당 규칙에 연결된 스크립트 버전 |
| `artifact_ref` | 실행 파일 참조 | `TEXT` | 불가 | 실행 스크립트의 버전이 고정된 위치 또는 참조값 |
| `artifact_digest` | 실행 파일 검증값 | `TEXT` | 불가 | 실행 코드의 동일성을 확인하는 해시값 |
| `change_summary` | 변경 내용 | `TEXT` | 불가 | 최초 등록 또는 이전 버전 대비 변경 사항 |
| `registered_by` | 등록 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `registered_at` | 등록 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 버전 명세 등록 시각 |
| `deployed_at` | 배포 일시 | `TIMESTAMP WITH TIME ZONE` | 허용 | 실행 가능한 스크립트의 배포 완료 시각. 배포 전 NULL |

- input_schema: 필드별 필수 여부·NULL 허용·입력 방식·단계별 편집 가능 여부·변경 적용 범위를 담는 JSON 명세.
- 등록된 버전의 명세·코드 참조는 불변. 변경 버전은 새 rule_version_id와 version_label로 저장.
- uploaded_file.applied_rule_version_id는 해당 파일에 적용된 고정 버전을 참조.
