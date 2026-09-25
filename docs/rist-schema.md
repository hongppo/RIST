---
type: planning
hub: "[[💡planning]]"
created_at: 2026-09-16
updated_at: 2026-09-25
client: "[[RIST(포항산업과학연구원)]]"
project: "[[RIST 데이터 표준화 프로그램 개발]]"
status: 초안
version: 1
---

## 변경 이력

| 변경일 | 구분 | 주요 변경 내용 |
| --- | --- | --- |
| 2026/09/23 | 채취법 코드·저장값 보완 | 채취법 마스터의 고시번호·시험방법 코드 분리 및 설명·적용 조건 정의 보완. 검토·최종 결과에 선택 당시 코드 또는 추출값을 보존하는 컬럼 추가 |
| 2026/09/21 | 저장·정밀도 정합성 | 검토 중 부분 추출 좌표의 작업 저장 허용과 최종 좌표 쌍 검증 분리. 소수점 10자리 초과 반올림·정밀값 재사용 명시. 파서 1:N 반환을 행별 1:1 저장으로 변환하는 순서·ID·원문 보존 계약 보완 |
| 2026/09/21 | 행별 저장·목록 구조 | 기본 기록·물질 결과를 행별 1:1로 변경하고 원본 기록 순서 보존. 담당자·기관 전용 테이블 추가로 17개에서 19개 테이블로 확장. 다국어 명칭·비고·주소·분석법 코드 분리, 내부 물질 추천 기준 및 변경·저장·복원 규칙 정리 |
| 2026/09/18 | 좌표 정밀도 | 위도·경도를 DECIMAL(13,10)으로 명시하고 좌표 자릿수·도분초 변환 반올림·원문 보존 기준 추가 |
| 2026/09/16 | 최초 통합 | 기본·추가 스키마와 검토·인증·규칙 버전 구조를 17개 논리 테이블로 통합 |

## 문서 개요

| 항목 | 내용 |
| --- | --- |
| 목적 | 환경데이터 표준화 프로그램의 데이터 저장 구조 정의 |
| 구성 | 19개 논리 테이블의 컬럼·관계·제약 조건 |

## 테이블 목록

| 테이블명 | 한글 이름 | 간단한 설명 | 바로가기 |
| --- | --- | --- | --- |
| `analysis_record` | 분석 기본 기록 | 결과 행별로 독립 저장한 시료·담당자·기관·일자·좌표 | [상세](#analysis_record) |
| `analysis_result` | 물질별 분석 결과 | 분석 기록별 물질·BASE·방법·결과·단위 | [상세](#analysis_result) |
| `uploaded_file` | 업로드 파일 | 원본 파일·업로더·처리 상태·적용 규칙·이력 | [상세](#uploaded_file) |
| `review_work` | 데이터 검토 작업 | 작업 상태·버전·저장 기준점 | [상세](#review_work) |
| `review_record` | 검토 중 분석 기본 기록 | 결과 행별 기본 항목의 추출값·수정값 | [상세](#review_record) |
| `review_result` | 검토 중 물질별 결과 | 최종 저장 전 물질별 추출값·수정값·검증 상태 | [상세](#review_result) |
| `user_account` | 회원 | 사용자 이름·역할·계정 상태 | [상세](#user_account) |
| `user_identity` | 회원 인증 정보 | 인증 제공자별 회원 식별 정보 | [상세](#user_identity) |
| `person_master` | 분석 담당자 목록 | 담당자명·소속·부서·비고 | [상세](#person_master) |
| `institution_master` | 분석 기관 목록 | 한글명·영문명·약칭·비고 | [상세](#institution_master) |
| `location_master` | 지역·관측 지점 목록 | 반복 사용하는 지점명·주소·위경도 | [상세](#location_master) |
| `substance_master` | 내부 물질 추천 기준 | 표준 물질명·CAS 기반 내부 식별·추천 기준 | [상세](#substance_master) |
| `base_master` | BASE 목록 | BASE 선택·매칭 기준 | [상세](#base_master) |
| `sampling_method_master` | 채취법 목록 | 채취법 명칭·고시번호·시험방법 코드·설명·적용 조건 | [상세](#sampling_method_master) |
| `analysis_method_master` | 분석법 목록 | 분석법 명칭·고시번호·방법 코드 | [상세](#analysis_method_master) |
| `substance_method_map` | 물질별 방법·추천 매핑 | 내부 물질 기준과 BASE·방법 추천 조합 연결 | [상세](#substance_method_map) |
| `common_option` | 공통 선택 항목 | 구분·매체·단위의 그룹별 목록 | [상세](#common_option) |
| `file_type_master` | 파일 유형 목록 | 유형 코드·명칭·사용 여부·현재 적용 버전 | [상세](#file_type_master) |
| `file_type_rule_version` | 유형별 추출 규칙 버전 | 판별·추출·입력 명세·실행 스크립트·변경 이력 | [상세](#file_type_rule_version) |

## 테이블별 상세 항목

### 공통 표기·저장 기준

| 항목 | 기준 |
| --- | --- |
| 스키마 수준 | DBMS 미지정의 논리 스키마 |
| ID | UUID 자동 발급. 검토 기록·결과의 ID를 최종 테이블에도 재사용 |
| NULL | 값이 없으면 SQL NULL. 빈 값의 안내 문구나 문자열 `NULL`로 대체하지 않음 |
| 업무 필수값 | 표의 NULL은 저장 구조의 허용 여부. 최종 확정·저장 시 파일 전체 행에 공통 필수 6항목(분석물질·결과·단위·채취일자·위도·경도)을 검증하고, 해당 유형의 input_schema로 확정된 추가 조건을 검증. 유형별 명세로 공통 필수 조건을 완화하지 않음 |
| 숫자 | 정밀 소수형 사용. 좌표는 아래 자릿수 규칙 적용. 그 외 DECIMAL의 정밀도·소수 자릿수는 원본 최대 범위로 확정. 임의 반올림·절삭 금지 |
| 시스템 시각 | TIMESTAMP WITH TIME ZONE. UTC 저장 |
| 분석 일시 | 원본의 날짜·시각·정밀도 보존. 실제 시각이 없는 날짜를 00:00으로 만들지 않음 |
| 좌표 | 십진수 도 단위의 위도·경도. 지도용 WGS 84를 저장 기준으로 제안하며, 다른 원본 좌표계는 유형별 변환 명세 필요 |
| 좌표 자릿수 | 위도·경도 모두 `DECIMAL(13,10)`. 전체 13자리 중 소수부 10자리, 정수부 최대 3자리. analysis_record·review_record·location_master에 동일 적용 |
| 십진수 좌표 입력 | 반올림 전 원래 값이 위도 -90 이상 90 이하, 경도 -180 이상 180 이하인지 먼저 검증. 소수점 10자리 이하는 값 변경 없이 저장. 10자리 초과는 십진수 정밀 연산으로 소수점 11번째 자리에서 절댓값 기준 5 이상을 올리고 부호를 유지하여 10자리로 저장. DB의 자동 반올림·절삭에 맡기지 않으며 파일 원문은 source_snapshot에 보존 |
| 도분초 좌표 변환 | 원래 좌표의 형식·범위를 검증하고 십진수 정밀 연산으로 변환. 중간 계산에서 반올림하지 않으며 저장할 값의 마지막 변환에서 소수점 11번째 자리 기준으로 1회 반올림. 절댓값 기준 5 이상은 올리고 부호 유지. 파일의 도분초 원문은 source_snapshot에 보존 |
| 좌표값 재사용 | 십진수 입력·도분초 변환 모두 저장할 값의 정밀도 확정 시에만 반올림. 이미 10자리로 확정한 검토 업무값은 작업 저장·최종 저장 시 그대로 재사용하고 재변환·중복 반올림하지 않음. 수정하지 않은 좌표는 내부 정밀값을 유지하며 표시용 반올림 값으로 덮어쓰지 않음 |
| 보존 | 최초 추출값과 최종값을 분리. 목록 ID와 저장 당시 명칭·값을 함께 보존 |
| 참조 정합성 | 목록에 연결된 표시값을 직접 수정하면 기존 ID를 재검증. 연결이 유효하지 않으면 ID만 NULL로 해제하고 수정값은 보존 |
| 최종 데이터 | 같은 파일의 analysis_record·analysis_result와 최종 상태를 하나의 트랜잭션으로 저장 |

### 주요 관계

| 관계 | 연결 |
| --- | --- |
| 회원 → 업로드 | user_account 1 : N uploaded_file |
| 회원 → 인증 정보 | user_account 1 : N user_identity |
| 업로드 → 검토 작업 | uploaded_file 1 : 0-1 review_work |
| 검토 작업 → 기본 기록 → 결과 | review_work 1 : N review_record 1 : 1 review_result |
| 업로드 → 최종 기본 기록 → 결과 | uploaded_file 1 : N analysis_record 1 : 1 analysis_result |
| 파일 유형 → 규칙 버전 | file_type_master 1 : N file_type_rule_version |
| 물질 → 방법·추천 조합 | substance_master 1 : N substance_method_map |
| 담당자 → 기본 기록 | person_master 1 : N review_record / analysis_record. 기록의 person_id는 NULL 허용 |
| 분석 기관 → 기본 기록 | institution_master 1 : N review_record / analysis_record. 기록의 institution_id는 NULL 허용 |

### 행별 저장·변경 기준

| 항목 | 기준 |
| --- | --- |
| 저장 단위 | 물질 결과 한 행마다 독립된 기본 기록 1건과 결과 1건을 1:1로 생성. 검토·최종 테이블에 동일 적용 |
| 파서 반환·저장 변환 | 파서는 원본 기록별 basic + results[]의 1:N 반환을 유지. 공통 저장 계층이 results[]의 결과마다 독립된 기본 기록·결과 한 쌍을 생성하고 basic의 기본값을 복사. 원본 위치·source_snapshot도 각 행에 보존 |
| 순서 매핑 | 파서의 record_order는 DB source_record_order로 매핑. 원본 기록 순서 → 해당 기록 내 결과 순서로 전체 결과를 펼쳐 DB record_order를 1부터 부여. result_order는 원본 기록 내 순서를 유지하며 1:1 쌍마다 1로 초기화하지 않음 |
| ID 생성 | 공통 저장 계층이 최초 검토 행 생성 시 record_id·result_id를 발급. 이후 검토·정렬·되돌리기·최종 저장에서 같은 ID 유지 |
| 원본 연결 | 같은 파일의 source_record_order가 같으면 동일 원본 분석 기록에서 파생된 행. result_order는 해당 원본 기록 내 결과 순서. source_locator·source_snapshot은 최초 원본 위치·값을 보존 |
| 행 식별·정렬 | record_id·result_id·record_order는 최초 행 생성 후 변경하지 않음. record_order는 원본 기록 순서와 그 안의 결과 순서로 펼친 파일 전체 행 순서. 화면 정렬·조회 범위와 무관 |
| 기본값 독립성 | 같은 원본 분석 기록에서 나온 행도 기본값을 각각 보유. 값이 같아도 기본 기록을 합치거나 공유하지 않음 |
| 개별 변경 | 지정한 result_id와 그에 1:1로 연결된 record_id만 변경. 다른 선택 행·동일 원본 기록의 행으로 전파하지 않음 |
| 선택 변경 | 체크된 모든 대상 result_id에 해당 항목만 적용. 아직 조회하지 않은 선택 행도 포함 |
| 일괄 변경 | 조회·선택 여부와 무관하게 해당 work_id의 전체 행에 해당 항목만 적용 |
| 1단계 변경 | 첫 번째 record_order의 행을 기준값으로 조회하되 변경한 항목은 파일 전체 행에 적용. 다른 항목은 유지 |
| 변경 원자성 | 한 번의 변경 대상 전체를 동일 revision에서 검증·반영. 목록 ID와 기록값, 지역 연결·명칭·좌표 쌍은 함께 반영하며 부분 적용하지 않음 |
| 불변 정보 | 원본 순서·행 ID·source_snapshot·result_raw는 변경·되돌리기·작업 저장 기준점 복원 시에도 유지 |

### 목록 연결·표시값 기준

| 항목 | 기준 |
| --- | --- |
| 목록형 항목 | 구분·매체·담당자·분석 기관·BASE·채취법·분석법·단위의 사용자 변경은 기존 목록 선택 또는 신규 등록 후 선택으로 확정. 검색 문자열만으로 업무값을 확정하지 않음 |
| 추출 미매칭값 | 목록에 없는 추출값은 해당 표시값과 원문을 보존하고 ID만 NULL 허용. 목록 등록을 강제하거나 추출값을 자동 삭제하지 않음 |
| 직접 입력 항목 | 시료명·분석 물질·결과·일자·기간·좌표는 직접 입력·수정 가능. 필드별 입력 형식·필수 여부는 유형별 명세 적용 |
| 다국어 명칭 | institution_master·base_master·sampling_method_master·analysis_method_master의 한글명·영문명은 각각 NULL 허용. 앞뒤 공백 제거 후 빈 값은 NULL로 정규화하고 하나 이상 유효한 이름 필수 |
| 선택 시 표시명 | 다국어 목록은 한글명이 있으면 한글명, 없으면 영문명을 사용. 기관 약칭은 보조 정보이며 이름 필수 조건을 대체하지 않음. 단일 명칭 목록은 해당 명칭 사용 |
| 기록 시점 보존 | 목록 선택 시 ID와 당시 표시값을 함께 기록. 채취법·분석법은 고시번호·시험방법 코드도 각각 복사. 이후 목록 수정은 기존 기록값을 자동 변경하지 않음 |
| 신규 등록·변경 구분 | 목록 등록과 검토값 변경은 별도 처리. 신규 등록만으로 검토값을 변경하지 않으며, 검토 변경을 되돌려도 등록된 목록 항목은 삭제하지 않음 |
| 식별·비활성화 | 이름만으로 전역 UNIQUE를 설정하지 않음. ID로 식별하고, 이미 참조된 항목은 삭제 대신 비활성화 |

### 공통 데이터 표현

| 저장 항목 | 내용·기준 |
| --- | --- |
| source_snapshot | 필드별 최초 추출 문자열·해석값·원본 위치. 정밀 숫자는 JSON에서도 문자열로 보존. 값이 없는 필드도 추출 여부 구분 |
| field_meta.was_extracted | 최초 파일 추출 여부. 값 변경 후에도 최초 추출 여부 유지 |
| field_meta.value_source | 현재 값의 출처: EXTRACTED / MANUAL / MATCHED / SYSTEM |
| field_meta.input_mode | LIST / DIRECT / DATE_TIME / COORDINATE / SYSTEM. 값의 입력 방식 코드 |
| field_meta.is_modified | 최초 추출값 대비 현재 값의 변경 여부. 마지막 작업 저장 대비 변경 여부·미적용 입력 상태와 구분 |
| field_meta.match_status | MATCHED: 목록 연결, UNRESOLVED: 값은 있으나 미연결, EMPTY: 값 없음, NOT_REQUIRED: 목록 참조 대상 아님 |
| validation_issues | 필드명·오류 코드·수준·안내의 목록. 필수값 오류·형식 오류와 단순 미입력 안내 구분 |
| checkpoint_values | 마지막 작업 저장 시점의 업무값·목록 ID·field_meta. 원본 스냅샷은 별도 불변 보존. 복원 시 검증 결과 재계산 |

- field_meta와 source_snapshot은 **컬럼명별 객체**로 저장. 검토·최종 테이블에 동일한 필드 상태 정의 적용.
- 추출값이 타입·범위에 맞지 않으면 최초 문자열과 오류를 보존하고, 검토 중에는 유효한 업무값이 확정되기 전까지 해당 타입 컬럼은 NULL 허용. 최종 기록의 필수 좌표에 이 임시 NULL 허용을 적용하지 않음. source_snapshot 내부의 최초 좌표 누락·원문은 보완 후에도 그대로 보존.
- 목록 미선택이어도 직접 입력값·추출값이 있으면 보존. 목록 ID 미연결만으로 표시값을 NULL로 덮어쓰지 않음.
- 업무값과 기준 목록은 별도 저장. 내부 추천 연결은 BASE·방법의 실제 선택값을 확정하거나 덮어쓰지 않음.
- 회원·기준 목록의 참조 행은 삭제 대신 비활성화. 업무 데이터의 회원·지점·물질·방법 연결이 삭제로 끊어지지 않게 처리.

### analysis_record

**분석 기본 기록** — 최종 저장한 기본 정보.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `record_id` | 분석 기록 ID | `UUID` | 불가 | PK. 검토 기록과 같은 ID |
| `file_id` | 업로드 파일 ID | `UUID` | 불가 | FK → uploaded_file.file_id |
| `record_order` | 파일 내 행 순서 | `INTEGER` | 불가 | 1 이상. 파일 내 물질 결과 행의 고정 순서 |
| `source_record_order` | 원본 분석 기록 순서 | `INTEGER` | 불가 | 1 이상. 같은 원본 기록에서 나온 행은 동일 값. 변경 불가 |
| `created_by` | 등록 회원 ID | `UUID` | 불가 | FK → user_account.user_id. 업로드 회원 |
| `category_option_id` | 구분 목록 ID | `UUID` | 허용 | FK → common_option.option_id. CATEGORY 그룹 |
| `category` | 구분 | `TEXT` | 허용 | 추출값 또는 선택 당시 명칭 보존 |
| `medium_option_id` | 매체 목록 ID | `UUID` | 허용 | FK → common_option.option_id. MEDIUM 그룹 |
| `medium` | 매체 | `TEXT` | 허용 | 추출값 또는 선택 당시 명칭 보존 |
| `sample_name` | 시료명 | `TEXT` | 허용 | 시료의 표시 이름. 식별키로 사용하지 않음 |
| `person_id` | 담당자 ID | `UUID` | 허용 | FK → person_master.person_id |
| `person_in_charge` | 담당자 | `TEXT` | 허용 | 분석 업무 담당자. 로그인 회원과 별개 |
| `institution_id` | 분석 기관 ID | `UUID` | 허용 | FK → institution_master.institution_id |
| `analysis_institution` | 분석 기관 | `TEXT` | 허용 | 추출값 또는 선택 당시 기관 표시명 |
| `collected_date` | 채취 날짜 | `DATE` | 허용 | 날짜 부분. 날짜만 확인되어도 저장 |
| `collected_at` | 채취 일시 | `TIMESTAMP` | 허용 | 실제 시각이 확인된 경우에만 저장 |
| `collected_precision` | 채취 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analyzed_date` | 분석 날짜 | `DATE` | 허용 | 분석 시작 날짜 |
| `analyzed_at` | 분석 일시 | `TIMESTAMP` | 허용 | 분석 시작 시각이 확인된 경우에만 저장 |
| `analyzed_precision` | 분석 일자 정밀도 | `TEXT` | 허용 | UNKNOWN / DATE / MINUTE / SECOND |
| `analysis_duration_days` | 분석 기간 | `INTEGER` | 허용 | 일 단위, 1 이상. 시작일만 있으면 1일 |
| `location_id` | 등록 지점 ID | `UUID` | 허용 | FK → location_master.location_id. 파일 추출·직접 좌표는 미연결 가능 |
| `location_name` | 등록 지점명 | `TEXT` | 허용 | 지역 선택 시 해당 시점 명칭 보존 |
| `latitude` | 위도 | `DECIMAL(13,10)` | 불가 | -90 이상 90 이하. 측정 당시 좌표. 모든 최종 행에 필수 |
| `longitude` | 경도 | `DECIMAL(13,10)` | 불가 | -180 이상 180 이하. 측정 당시 좌표. 모든 최종 행에 필수 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `extracted_at` | 추출 완료 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | uploaded_file.extracted_at과 일치 |
| `created_at` | 최종 등록 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 파일 전체 최종 저장 시 기록 |

- 저장 단위: 물질 결과 한 행의 전용 기본 기록 1건. 같은 시료·원본 기록에서도 결과 행마다 별도 record_id를 사용.
- `record_id`는 review_record의 ID를 재사용하되 검토 테이블에 대한 FK는 두지 않음. `created_by`는 업로드 회원, person_in_charge는 업무 담당자.
- `UNIQUE(file_id, record_order)`. file_id 단독 UNIQUE는 적용하지 않음. 같은 파일에 여러 기록 연결.
- 날짜만 있으면 *_date만 저장하고 *_at은 NULL. 일시가 있으면 두 날짜 부분을 일치시키며 정밀도 보존.
- 모든 최종 행의 위도·경도는 모두 필수이며 각각 NOT NULL과 범위 제약을 적용. 한쪽 또는 양쪽 NULL은 최종 저장 불가. 위도 0·경도 0은 유효한 입력값이며 누락으로 보지 않음. location_id·location_name 없이 유효한 좌표 쌍만 저장 가능. 등록 지점 수정 시 기존 측정 좌표·지점명을 자동 변경하지 않음.

### analysis_result

**물질별 분석 결과** — 최종 저장한 물질별 결과.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `result_id` | 분석 결과 ID | `UUID` | 불가 | PK. 검토 결과와 같은 ID |
| `record_id` | 분석 기록 ID | `UUID` | 불가 | FK → analysis_record.record_id. UNIQUE. 결과 한 행의 전용 기본 기록 |
| `result_order` | 원본 기록 내 결과 순서 | `INTEGER` | 불가 | 1 이상. 원본 분석 기록 내 순서이며 최초 생성 후 변경 불가 |
| `substance_id` | 분석 물질 ID | `UUID` | 허용 | FK → substance_master.substance_id. 미매칭 시 NULL |
| `substance_name` | 분석 물질명 | `TEXT` | 허용 | 추출·수정·직접 입력한 이름. CAS 포함 표기 보존 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → base_master.base_id |
| `base_name` | BASE 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → sampling_method_master.sampling_method_id |
| `sampling_method_name` | 채취법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `sampling_method_notice_number` | 채취법 고시번호 | `TEXT` | 허용 | 추출값 또는 선택 당시 고시번호 보존 |
| `sampling_method_test_code` | 채취법 시험방법 코드 | `TEXT` | 허용 | 추출값 또는 선택 당시 시험방법 코드 보존 |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → analysis_method_master.analysis_method_id |
| `analysis_method_name` | 분석법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `analysis_method_notice_number` | 분석법 고시번호 | `TEXT` | 허용 | 추출값 또는 선택 당시 고시번호 보존 |
| `analysis_method_test_code` | 분석법 시험방법 코드 | `TEXT` | 허용 | 추출값 또는 선택 당시 시험방법 코드 보존 |
| `result_text` | 결과 표시값 | `TEXT` | 허용 | 검토한 최종 문자열. 비수치·부등호 표기 포함 |
| `result_value` | 숫자 결과 | `DECIMAL` | 허용 | result_text가 수치로 확정되는 경우만 저장 |
| `result_raw` | 결과 원문 | `TEXT` | 허용 | 파일에서 추출한 최초 결과 문자열. 수정 불가 |
| `unit_option_id` | 단위 목록 ID | `UUID` | 허용 | FK → common_option.option_id. UNIT 그룹 |
| `unit` | 단위 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출 표기 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `created_at` | 최종 등록 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 파일 전체 최종 저장 시 기록 |

- 저장 단위: 독립된 기본 기록과 1:1인 물질 결과 한 행. 같은 물질의 반복 측정도 별도 행으로 보존.
- `result_id`는 review_result에서 발급한 값을 최종 저장 시 그대로 사용. review_result에 대한 FK는 두지 않음.
- `UNIQUE(record_id)`로 기본 기록 공유를 차단. 기본 기록·결과를 한 쌍으로 생성하고 고아 기본 기록이 없도록 최종 저장 시 검증. 물질명·물질 ID는 고유키가 아님.
- 미매칭 추출 명칭·고시번호·시험방법 코드·단위는 ID가 NULL이어도 보존. substance_id 미매칭은 저장 차단 사유가 아님.
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

- 파일당 review_work는 최대 1건. 모든 검토 단계가 같은 work_id와 데이터를 참조. 원본 분석 기록을 물질 결과 행으로 펼칠 때 각 행에 기본 기록·결과를 한 쌍씩 생성하고 원본 기본값·스냅샷을 복사.
- revision을 기준으로 동시 변경을 제어. 변경·복원 시 revision은 증가하고 validated_revision은 무효화.
- 작업 저장 시 전체 검토 행 쌍의 checkpoint_values와 saved_revision·work_saved_at·work_saved_by를 하나의 트랜잭션으로 갱신. 실패 시 기존 저장 기준점과 현재 변경값·작업 이력 유지.
- 최종 데이터는 필수값·형식 검증을 통과한 동일 revision에서 생성. 기록·결과가 0건이거나 미해결 오류가 있으면 최종 저장 불가.
- analysis_record·analysis_result 생성과 파일 SAVED·작업 FINALIZED 상태는 같은 트랜잭션으로 확정. 기본 기록·결과는 1:1이며 saved_record_count = saved_result_count = 전체 확정 행 수. 일부 데이터만 남는 최종 저장은 허용하지 않음.

#### 변경·작업 저장·복원

| 동작 | 데이터 처리 기준 |
| --- | --- |
| 항목 변경 | 검토 업무값에 반영하고 revision 증가·validated_revision 무효화. checkpoint_values·saved_revision은 갱신하지 않음 |
| 작업 저장·단계 이동 시 저장 | 유효한 부분 추출 좌표와 누락 상태를 포함하여 전체 검토 행 쌍의 저장 기준점을 생성. 좌표 쌍 완성·필수값 충족은 이 단계의 필수 조건이 아님. 잘못 추출된 원문·오류는 source_snapshot·validation_issues에 보존하고 유효하지 않은 타입·범위의 업무값은 NULL로 관리. 새 사용자 입력의 형식·범위·참조 오류는 검증하여 해당 변경을 반영하지 않음 |
| 기준점 대비 변경 | 현재 업무값·ID·field_meta와 checkpoint_values를 비교. revision 차이는 작업 발생 여부이며 field_meta.is_modified와 동일한 뜻이 아님 |
| 되돌리기 | 마지막 작업 저장 이후 최대 10개 변경 작업을 역순 복원. 개별·선택·일괄 변경 각 1회를 한 단계로 취급하고 대상 행 ID·변경 전후 값·연결·field_meta를 한 묶음으로 관리 |
| 이력 수명 | 작업 저장 성공 시 이전 되돌리기 이력 종료. 영구 이력 테이블은 추가하지 않으며, 이력의 보관 위치·재접속 시 복구 방식은 구현 명세에서 확정. 이력이 없으면 단계별 되돌리기 불가 |
| 기준점 복원 | 같은 saved_revision의 모든 기본 기록·결과 checkpoint_values를 함께 복원. ID·원본 순서·원문은 유지하고 revision 증가·검증 재수행. 복원 전 되돌리기 이력은 종료 |
| 최종 저장 | 미반영 개별 입력은 검증 후 반영하고, 미적용 선택·일괄 입력은 적용 또는 취소로 해소한 뒤 전체 파일을 검증. 표시·로드·선택 여부와 관계없이 파일 전체 행에서 공통 필수 6항목을 검증. 위도·경도는 각각 존재하고 범위가 유효해야 하며 0은 누락이 아님. 좌표 한쪽 또는 양쪽 누락 시 최종 확정·저장을 차단하고 유형별 확정 추가 조건도 충족해야 함. 같은 revision의 행 쌍을 ID·순서 그대로 확정하며 실패 시 현재 검토값 유지 |
| 상태 구분 | was_extracted는 최초 추출 여부, is_modified는 최초값 대비 변경 여부. 검색어·미적용 선택·행 선택·조회 행 수 등은 영구 업무 테이블에 저장하지 않음 |

- 추출 시 같은 work_id 내 `(source_record_order, result_order)` 조합의 중복을 검증. 최종 저장 시 같은 file_id에서 동일 조합을 검증하며, 두 테이블의 조인 기준 트랜잭션 검증으로 보장.
- 최초 작업 저장 전에는 checkpoint_values가 없으므로 저장 기준점 복원을 제공하지 않음. 이후 재진입 시 최소 복원 단위는 전체 행 쌍의 마지막 성공한 작업 저장 기준점.

### review_record

**검토 중 분석 기본 기록** — 최종 저장 전 기본 항목.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `record_id` | 검토 기본 기록 ID | `UUID` | 불가 | PK. 공통 저장 계층의 최초 검토 행 생성 시 발급, 최종 기록에 재사용 |
| `work_id` | 검토 작업 ID | `UUID` | 불가 | FK → review_work.work_id |
| `record_order` | 파일 내 행 순서 | `INTEGER` | 불가 | 1 이상. UNIQUE(work_id, record_order). 최초 생성 후 변경 불가 |
| `source_record_order` | 원본 분석 기록 순서 | `INTEGER` | 불가 | 1 이상. 같은 원본 기록에서 나온 행은 동일 값. 변경 불가 |
| `category_option_id` | 구분 목록 ID | `UUID` | 허용 | FK → common_option.option_id. CATEGORY 그룹 |
| `category` | 구분 | `TEXT` | 허용 | 추출값 또는 선택 당시 명칭 보존 |
| `medium_option_id` | 매체 목록 ID | `UUID` | 허용 | FK → common_option.option_id. MEDIUM 그룹 |
| `medium` | 매체 | `TEXT` | 허용 | 추출값 또는 선택 당시 명칭 보존 |
| `sample_name` | 시료명 | `TEXT` | 허용 | 시료의 표시 이름. 식별키로 사용하지 않음 |
| `person_id` | 담당자 ID | `UUID` | 허용 | FK → person_master.person_id |
| `person_in_charge` | 담당자 | `TEXT` | 허용 | 분석 업무 담당자. 로그인 회원과 별개 |
| `institution_id` | 분석 기관 ID | `UUID` | 허용 | FK → institution_master.institution_id |
| `analysis_institution` | 분석 기관 | `TEXT` | 허용 | 추출값 또는 선택 당시 기관 표시명 |
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

- 업무 컬럼은 analysis_record와 같은 의미·형식. 검토 중에는 유효한 한쪽 추출 좌표만 보존·작업 저장할 수 있으며, 최종 기록의 위도·경도 모두 필수 제약과 구분. 1단계에서 필수값 누락만으로 작업 저장·2단계 이동을 차단하지 않음. 누락·미확정·유효하지 않은 값은 NULL로 두고 최초 문자열과 오류는 별도 보존.
- 구분부터 경도까지의 기본 항목은 결과 한 행의 전용 record_id에 저장. 다른 결과 행과 기본 기록을 공유하지 않으며, 같은 원본 기본값도 결과 행별로 복사하여 독립 보존.
- source_snapshot은 불변. field_meta는 초기 추출 여부와 현재 입력 방식·수정 여부를 구분.
- checkpoint_values는 업무값과 연결 ID·필드 상태를 함께 저장. 복원 시 validation_issues를 재검증하고 validated_revision을 무효화.
- 작업 저장·최종 저장의 데이터 범위는 동일 work_id에 속한 전체 기록과 결과.

### review_result

**검토 중 물질별 결과** — 최종 저장 전 물질 항목.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `result_id` | 검토 물질 결과 ID | `UUID` | 불가 | PK. 공통 저장 계층의 최초 검토 행 생성 시 발급, 최종 결과에 재사용 |
| `record_id` | 검토 기본 기록 ID | `UUID` | 불가 | FK → review_record.record_id. UNIQUE. 결과 한 행의 전용 기본 기록 |
| `result_order` | 원본 기록 내 결과 순서 | `INTEGER` | 불가 | 1 이상. 원본 분석 기록 내 순서이며 최초 생성 후 변경 불가 |
| `substance_id` | 분석 물질 ID | `UUID` | 허용 | FK → substance_master.substance_id. 미매칭 시 NULL |
| `substance_name` | 분석 물질명 | `TEXT` | 허용 | 추출·수정·직접 입력한 이름. CAS 포함 표기 보존 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → base_master.base_id |
| `base_name` | BASE 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → sampling_method_master.sampling_method_id |
| `sampling_method_name` | 채취법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `sampling_method_notice_number` | 채취법 고시번호 | `TEXT` | 허용 | 추출값 또는 선택 당시 고시번호 보존 |
| `sampling_method_test_code` | 채취법 시험방법 코드 | `TEXT` | 허용 | 추출값 또는 선택 당시 시험방법 코드 보존 |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → analysis_method_master.analysis_method_id |
| `analysis_method_name` | 분석법 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출값 |
| `analysis_method_notice_number` | 분석법 고시번호 | `TEXT` | 허용 | 추출값 또는 선택 당시 고시번호 보존 |
| `analysis_method_test_code` | 분석법 시험방법 코드 | `TEXT` | 허용 | 추출값 또는 선택 당시 시험방법 코드 보존 |
| `result_text` | 결과 표시값 | `TEXT` | 허용 | 검토한 최종 문자열. 비수치·부등호 표기 포함 |
| `result_value` | 숫자 결과 | `DECIMAL` | 허용 | result_text가 수치로 확정되는 경우만 저장 |
| `result_raw` | 결과 원문 | `TEXT` | 허용 | 파일에서 추출한 최초 결과 문자열. 수정 불가 |
| `unit_option_id` | 단위 목록 ID | `UUID` | 허용 | FK → common_option.option_id. UNIT 그룹 |
| `unit` | 단위 표시값 | `TEXT` | 허용 | 선택 당시 명칭 또는 추출 표기 |
| `source_locator` | 원본 내 위치 | `TEXT` | 허용 | 원본 페이지·행·셀·추출 구간 식별 |
| `source_snapshot` | 최초 추출값 | `JSON` | 불가 | 최초 추출값·원본 위치 보존. 이후 수정 불가 |
| `field_meta` | 필드 상태 | `JSON` | 불가 | 추출 여부·현재 입력 방식·수정 여부·목록 연결 상태 |
| `validation_issues` | 필드 검증 결과 | `JSON` | 불가 | 오류 코드·대상 필드·수준·안내. 오류가 없으면 빈 목록 |
| `checkpoint_values` | 작업 저장값 | `JSON` | 허용 | 마지막 명시적 작업 저장의 업무값·목록 ID·field_meta. 최초 저장 전 NULL |
| `updated_by` | 최근 변경 회원 ID | `UUID` | 허용 | FK → user_account.user_id |
| `created_at` | 검토 행 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 추출 결과의 행 생성 시 기록 |
| `updated_at` | 검토 행 변경 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |

- 작업 소속은 전용 review_record.work_id로 결정. 별도 work_id 컬럼 없이 1:1 기본 기록으로 참조.
- 분석 물질·BASE·채취법·분석법·결과·단위는 result_id 단위로 저장. 기본 기록과 결과는 같은 트랜잭션에서 한 쌍으로 생성.
- result_raw와 source_snapshot은 최초 추출값. 검토 수정은 현재 표시값과 수치값에만 반영.
- checkpoint_values는 업무값·목록 ID·field_meta를 함께 보관하고 복원 시 재검증.
- 파일 내 행 순서는 전용 기본 기록의 record_order로 결정. result_order는 원본 추적용이며 검토 중 변경하지 않음.

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

### person_master

**분석 담당자 목록** — 로그인 회원과 별개인 업무 담당자.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `person_id` | 담당자 ID | `UUID` | 불가 | PK |
| `person_name` | 담당자명 | `TEXT` | 불가 | 앞뒤 공백 제거 후 유효한 이름 필수. 동명이인 허용 |
| `affiliation_department` | 소속·부서 | `TEXT` | 허용 | 등록한 소속·부서 문자열 |
| `description` | 비고 | `TEXT` | 허용 | 담당자 구분용 비고 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- person_id로 식별하며 이름에 UNIQUE를 적용하지 않음. 선택 시 person_in_charge에 당시 person_name을 보존.
- user_account와 자동 연결하지 않으며, 소속·부서만으로 institution_master 참조를 강제하지 않음.

### institution_master

**분석 기관 목록** — 기관의 한글명·영문명·약칭.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `institution_id` | 분석 기관 ID | `UUID` | 불가 | PK |
| `institution_name_ko` | 기관명(한글) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `institution_name_en` | 기관명(영문) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `abbreviation` | 약칭 | `TEXT` | 허용 | 기관 구분·검색용 약칭 |
| `description` | 비고 | `TEXT` | 허용 | 기관 비고 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- 공통 다국어 명칭·표시명 기준 적용. 선택 시 analysis_institution에 당시 표시명을 보존.
- 기관명·약칭에 전역 UNIQUE를 적용하지 않으며 institution_id로 식별.

### location_master

**지역·관측 지점 목록** — 지역·관측 지점명과 기준 좌표.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `location_id` | 지역·관측 지점 ID | `UUID` | 불가 | PK |
| `location_name` | 지역·관측 지점명 | `TEXT` | 불가 | 앞뒤 공백 제거 후 유효한 지점명 필수. 동명 허용 |
| `latitude` | 위도 | `DECIMAL(13,10)` | 불가 | WGS 84 좌표. `-90 ≤ 값 ≤ 90` |
| `longitude` | 경도 | `DECIMAL(13,10)` | 불가 | WGS 84 좌표. `-180 ≤ 값 ≤ 180` |
| `address` | 주소 | `TEXT` | 허용 | 지점 주소. 주소 입력만으로 좌표를 확정하지 않음 |
| `description` | 위치 설명 | `TEXT` | 허용 | 지점 구분을 위한 설명 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_by` | 등록 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `updated_by` | 수정 회원 ID | `UUID` | 불가 | FK → `user_account.user_id` |
| `created_at` | 생성 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 최초 등록 시각 |
| `updated_at` | 수정 일시 | `TIMESTAMP WITH TIME ZONE` | 불가 | 마지막 변경 시각 |

- 신규 지점 등록은 지점명·위도·경도가 모두 필수이며 WGS 84 범위 제약 적용. 업무 기록의 지점명 NULL 허용과 구분.
- 지점 선택 시 대상 행의 location_id·location_name·latitude·longitude를 함께 반영. 지점 정보 변경이 기존 기록의 명칭·좌표를 자동 변경하지 않음.
- 파일에서 추출한 좌표는 분석 기록별로 보존. 지점 참조 없이 location_id가 NULL인 기록도 허용.
- 지역·관측 지점명은 고유 키로 사용하지 않습니다. 동일 명칭의 지점은 위치 설명과 좌표로 구분합니다.
- 검토 중 좌표를 직접 수정해 선택한 지점과 달라지면 기록의 location_id·location_name을 해제하고 수정 좌표를 유지합니다. 최초 위치 정보는 source_snapshot에 보존합니다.

### substance_master

**내부 물질 추천 기준** — 표준 물질명·CAS로 내부 식별 및 추천 연결을 관리. 사용자 선택·신규 등록 목록이 아님.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `substance_id` | 내부 물질 기준 ID | `UUID` | 불가 | PK |
| `substance_name` | 표준 물질명 | `TEXT` | 불가 | 공백만 있는 값 불가. 내부 기준명 |
| `cas_number` | CAS 번호 | `TEXT` | 허용 | 값이 있는 경우 UNIQUE. 내부 식별용 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- 결과의 substance_name은 추출·직접 입력·수정한 값을 보존. 기준의 표준 이름으로 자동 덮어쓰지 않으며, 이름에 전역 UNIQUE를 적용하지 않음.
- 결과의 substance_id는 내부 매칭이 유효할 때만 연결. 기준에 없는 물질도 ID를 NULL로 두고 업무값을 저장 가능.
- 물질명 수정 시 내부 매칭을 재검증하고 유효하지 않으면 substance_id만 해제. 수정명·최초 source_snapshot과 기존 BASE·채취법·분석법 값·ID는 유지.
- CAS는 내부 기준에서 관리하며 업무 결과에 별도 CAS 컬럼을 추가하지 않음. 보고서의 ‘물질명 (CAS)’ 표기와 원문 스냅샷을 보존.
- 추천 조합·순위·매칭 알고리즘의 운영 기준은 별도 확정. 추천이 없거나 미매칭이어도 물질 저장을 차단하지 않음.

### base_master

**BASE 목록** — 한글명·영문명과 선택·매칭 기준.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `base_id` | BASE ID | `UUID` | 불가 | PK |
| `base_name_ko` | BASE명(한글) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `base_name_en` | BASE명(영문) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `description` | 비고 | `TEXT` | 허용 | 등록 비고 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- 공통 다국어 명칭·표시명 기준 적용. 명칭에 전역 UNIQUE를 적용하지 않으며 ID로 식별.
- 사용자 변경은 목록 선택 또는 신규 등록 후 선택으로 확정. 미매칭 추출값은 결과에 보존하며 자동 등록하지 않음.
- 선택 당시 표시값은 결과에 보존. 참조 중인 항목은 삭제 대신 비활성화.

### sampling_method_master

**채취법 목록** — 한글명·영문명·고시번호·시험방법 코드와 설명·적용 조건.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `sampling_method_id` | 채취법 ID | `UUID` | 불가 | PK |
| `notice_number` | 고시번호 | `TEXT` | 허용 | 고시번호. 시험방법 코드와 별도 저장 |
| `test_method_code` | 시험방법 코드 | `TEXT` | 허용 | 시험방법의 코드. 고시번호와 별도 저장 |
| `method_name_ko` | 채취법명(한글) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `method_name_en` | 채취법명(영문) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `description` | 설명·적용 조건 | `TEXT` | 허용 | 설명·적용 조건 원문. 확정된 자동 추천·입력 규칙을 의미하지 않음 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- 공통 다국어 명칭·표시명 기준 적용. 명칭에 전역 UNIQUE를 적용하지 않으며 ID로 식별.
- 사용자 변경은 목록 선택 또는 신규 등록 후 선택으로 확정. 미매칭 추출값은 결과에 보존하며 자동 등록하지 않음.
- 선택 당시 표시값은 결과에 보존. 참조 중인 항목은 삭제 대신 비활성화.
- 고시번호·시험방법 코드 각각에도 전역 UNIQUE를 적용하지 않음. review_result·analysis_result의 sampling_method_notice_number·sampling_method_test_code에 추출값 또는 선택 당시 값을 각각 보존. 마스터 변경으로 기존 결과값을 자동 변경하지 않음.
- 고시번호 공란을 시험방법 코드로 채우지 않음. 원문 코드 `-`는 문자 그대로 보존하고 공란으로 바꾸지 않으며, 원본 공란은 값이 없는 상태로 유지.

### analysis_method_master

**분석법 목록** — 한글명·영문명과 선택·매칭 기준.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `analysis_method_id` | 분석법 ID | `UUID` | 불가 | PK |
| `notice_number` | 고시번호 | `TEXT` | 허용 | 고시번호. 시험방법 코드와 별도 저장 |
| `test_method_code` | 시험방법 코드 | `TEXT` | 허용 | 시험방법의 코드. 고시번호와 별도 저장 |
| `method_name_ko` | 분석법명(한글) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `method_name_en` | 분석법명(영문) | `TEXT` | 허용 | 한글명·영문명 중 하나 이상 필수 |
| `description` | 설명·적용 조건 | `TEXT` | 허용 | 설명·적용 조건 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- 공통 다국어 명칭·표시명 기준 적용. 명칭에 전역 UNIQUE를 적용하지 않으며 ID로 식별.
- 사용자 변경은 목록 선택 또는 신규 등록 후 선택으로 확정. 미매칭 추출값은 결과에 보존하며 자동 등록하지 않음.
- 선택 당시 표시값은 결과에 보존. 참조 중인 항목은 삭제 대신 비활성화.
- 고시번호·시험방법 코드 각각에도 전역 UNIQUE를 적용하지 않음. 결과의 analysis_method_notice_number·analysis_method_test_code에 당시 값을 각각 보존.

### substance_method_map

내부 물질 기준과 매체별 BASE·채취법·분석법 추천 조합을 연결합니다. 실제 업무 결과의 선택값과 별개입니다.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `mapping_id` | 매핑 ID | `UUID` | 불가 | PK |
| `substance_id` | 분석 물질 ID | `UUID` | 불가 | FK → `substance_master.substance_id` |
| `medium_option_id` | 매체 항목 ID | `UUID` | 허용 | FK → `common_option.option_id`. `MEDIUM` 그룹만 허용. NULL은 매체 제한 없음 |
| `base_id` | BASE ID | `UUID` | 허용 | FK → `base_master.base_id` |
| `sampling_method_id` | 채취법 ID | `UUID` | 허용 | FK → `sampling_method_master.sampling_method_id` |
| `analysis_method_id` | 분석법 ID | `UUID` | 허용 | FK → `analysis_method_master.analysis_method_id` |
| `recommendation_rank` | 추천 순위 | `INTEGER` | 허용 | 순위 정책 미확정 시 NULL. 설정 시 0 이상이며 낮을수록 우선 |
| `match_conditions` | 추가 적용 조건 | `JSON` | 허용 | 조건 명세 확정 전 NULL. 확정 시 명세 버전·허용 조건만 저장 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id`. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → `user_account.user_id` |

- `base_id`·`sampling_method_id`·`analysis_method_id` 중 하나 이상 필수입니다. 여러 값이 있으면 하나의 적용 조합으로 관리합니다.
- 추천 적용 조건은 물질·매체·match_conditions로 표현. 추천 순위·자동 매칭 알고리즘·선택 정책은 별도 확정하며, 컬럼 존재만으로 운영 정책을 확정하지 않음.
- 동일 물질·매체·방법 조합·정규화한 추가 조건의 중복을 금지합니다. 이때 NULL끼리는 동일한 값으로 비교하며, DBMS에 맞는 제약 또는 트랜잭션 검증을 적용합니다.
- 물질·매체 변경 시 추천 후보는 재평가할 수 있으나, 업무 결과의 기존 BASE·방법 값·ID를 삭제하거나 추천값으로 자동 대체하지 않음. 실제 목록 참조의 유효성은 해당 값 변경 시 별도로 검증.

### common_option

**공통 선택 항목** — 구분·매체·단위의 등록 가능한 목록.

| 컬럼명 | 한글 이름 | 자료형 | NULL | 제약·설명 |
| --- | --- | --- | --- | --- |
| `option_id` | 항목 ID | `UUID` | 불가 | PK |
| `option_group` | 항목 그룹 | `TEXT` | 불가 | CATEGORY / MEDIUM / UNIT |
| `option_code` | 항목 코드 | `TEXT` | 불가 | 서버가 option_id의 UUID 문자열로 자동 생성. UNIQUE(option_group, option_code). 사용자 입력 없음 |
| `option_name` | 항목 이름 | `TEXT` | 불가 | 구분명·매체명·단위. 앞뒤 공백 제거 후 유효한 값 필수 |
| `description` | 비고 | `TEXT` | 허용 | 등록 비고 |
| `display_order` | 기본 표시 순서 | `INTEGER` | 불가 | 기본값 0, 0 이상. 낮을수록 먼저 표시 |
| `is_active` | 사용 여부 | `BOOLEAN` | 불가 | 기본값 `true` |
| `created_at` | 생성 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 서버 기록 |
| `created_by` | 생성 사용자 ID | `UUID` | 허용 | FK → user_account.user_id. 초기 목록 등록 시 NULL 허용 |
| `updated_at` | 최종 수정 시각 | `TIMESTAMP WITH TIME ZONE` | 불가 | 생성 시각으로 초기화, 변경 시 갱신 |
| `updated_by` | 최종 수정 사용자 ID | `UUID` | 허용 | FK → user_account.user_id |

- CATEGORY는 구분, MEDIUM은 매체, UNIT은 단위. 담당자·기관은 person_master·institution_master에서 관리.
- MEDIUM은 신규 등록 가능한 DB 목록. 부산물·대기·악취는 초기 항목으로 둘 수 있으나 고정값 제약이나 신규 등록 제한을 두지 않음.
- 참조 필드별 허용 그룹을 검증. 이름에 전역 UNIQUE를 적용하지 않으며 option_code는 생성 후 변경하지 않음.
- 추출 미매칭값은 업무 기록에 보존하고 ID만 NULL 허용. 사용자 변경은 목록 선택·신규 등록 후 선택으로 처리하며, 검색어·추출값을 자동 등록하지 않음.
- 기록 당시 표시값은 업무 기록에 보존. 참조 중인 항목은 삭제 대신 비활성화.

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
