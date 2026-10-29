/* 트리 순서대로 표시하며, 페이지 번호와 하단 이동은 최상위 목록별로 구분합니다.
 * 그룹: { id, title, children: [...] }
 * 페이지: { id, title, src, width, height, summary, kind, autoHeight? }
 * autoHeight는 data-document-root를 가진 문서의 실제 높이를 사용합니다.
 * 페이지 ID는 순서와 무관한 고유 값으로 유지합니다. src는 프로젝트 내부 HTML 상대 경로입니다.
 */
window.MOCKUP_VIEWER_MANIFEST = {
  title: '화면 기획서: RIST 데이터 표준화 프로그램',
  tree: [
    { id: 'rist-rule-overview', title: '총괄 규칙', children: [
        { id: 'rist-phase3-type-rule-overview', title: '유형별 적용 규칙 총괄표', src: 'pages/rist-phase3-type-rule-overview.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true }
    ] },
    {
      id: 'rist',
      title: '화면기획서(PoC)',
      children: [
        {
          id: 'rist-cover',
          title: '표지',
          src: 'pages/rist-cover.html',
          width: 1280,
          height: 800,
          kind: 'RIST · 표지',
          summary: 'RIST 데이터 표준화 프로그램 인터페이스 기획안 · 그로스마케팅랩 · v0.1'
        },
        {
          id: 'rist-change-history',
          title: '변경 히스토리',
          src: 'pages/rist-change-history.html',
          width: 1280,
          autoHeight: true,
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-login',
          title: '로그인',
          src: 'pages/rist-login.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-01',
          summary: '사용자 인증'
        },
        {
          id: 'rist-profile-menu',
          title: '프로필 메뉴',
          src: 'pages/rist-profile-menu.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload',
          title: '파일 업로드',
          src: 'pages/rist-upload.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-02',
          summary: '파일 선택 및 추출 시작'
        },
        {
          id: 'rist-processing',
          title: '파일 확인 및 추출',
          src: 'pages/rist-processing.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-03',
          summary: '처리 대상 파일과 업로드·유형 확인·추출 상태'
        },
        {
          id: 'rist-error',
          title: '오류 화면(파일 확인 및 추출)',
          src: 'pages/rist-error.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-03',
          summary: '파일 처리 오류 안내 및 파일 업로드 화면으로 복귀'
        },
        {
          id: 'rist-sheet-partial',
          title: '시트 확인(일부 추출)',
          src: 'pages/rist-sheet-partial.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-initial',
          title: '데이터 검토: 1단계(초기 상태)',
          src: 'pages/rist-review-preparation-initial.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-badge-states',
          title: '데이터 검토: 1단계(배지 상태)',
          src: 'pages/rist-review-preparation-badge-states.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-stage-confirm',
          title: '데이터 검토: 1단계(단계 이동 확인)',
          src: 'pages/rist-review-preparation-stage-confirm.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-dropdown',
          title: '데이터 검토: 1단계(드롭다운 예시)',
          src: 'pages/rist-review-preparation-dropdown.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-search',
          title: '데이터 검토: 1단계(검색 예시)',
          src: 'pages/rist-review-preparation-search.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-search-empty',
          title: '데이터 검토: 1단계(검색 결과 없을 때 예시)',
          src: 'pages/rist-review-preparation-search-empty.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-direct-input',
          title: '데이터 검토: 1단계(직접 입력 예시)',
          src: 'pages/rist-review-preparation-direct-input.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-region-examples',
          title: '데이터 검토: 1단계(지역 섹션 예시)',
          src: 'pages/rist-review-preparation-region-examples.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-date-time',
          title: '데이터 검토: 1단계(날짜, 시간 입력 예시)',
          src: 'pages/rist-review-preparation-date-time.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-selected',
          title: '데이터 검토: 1단계(값 선택 시)',
          src: 'pages/rist-review-preparation-selected.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-changed',
          title: '데이터 검토: 1단계(값 변경 시)',
          src: 'pages/rist-review-preparation-changed.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-preparation-add-modals',
          title: '데이터 검토: 1단계(신규 추가 모달)',
          src: 'pages/rist-review-preparation-add-modals.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-detail',
          title: '데이터 검토: 2단계',
          src: 'pages/rist-review-detail.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-04',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-review-detail-new',
          title: '데이터 검토: 2단계(신규)',
          src: 'pages/rist-review-detail-new.html',
          width: 1280, height: 800,
          kind: 'RIST · U-04', summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-save-confirm',
          title: '최종 저장 확인',
          src: 'pages/rist-save-confirm.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-saving',
          title: '최종 저장 중',
          src: 'pages/rist-saving.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-save-complete',
          title: '최종 저장 완료',
          src: 'pages/rist-save-complete.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-save-error',
          title: '오류 화면(최종 저장)',
          src: 'pages/rist-save-error.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-save-status',
          title: '최종 저장 상태 확인',
          src: 'pages/rist-save-status.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history',
          title: '업로드 이력',
          src: 'pages/rist-upload-history.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history-empty',
          title: '업로드 이력(이력 없음)',
          src: 'pages/rist-upload-history-empty.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history-no-results',
          title: '업로드 이력(검색 결과 없음)',
          src: 'pages/rist-upload-history-no-results.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history-error',
          title: '오류 화면(업로드 이력 조회)',
          src: 'pages/rist-upload-history-error.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history-detail',
          title: '업로드 이력 상세',
          src: 'pages/rist-upload-history-detail.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-upload-history-detail-unavailable',
          title: '업로드 이력 상세(원본 다운로드 불가)',
          src: 'pages/rist-upload-history-detail-unavailable.html',
          width: 1280, height: 800,
          summary: '', hideEmptyDescription: true
        }
      ]
    },
    {
      id: 'rist-phase2',
      title: '화면 기획서(2차 개선)',
      children: [
        {
          id: 'rist-phase2-cover',
          title: '표지',
          src: 'pages/rist-phase2-cover.html',
          width: 1280,
          height: 800,
          kind: 'RIST · 2차 개선 표지',
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-change-history',
          title: '변경 히스토리',
          src: 'pages/rist-phase2-change-history.html',
          width: 1280,
          autoHeight: true,
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-policy-changes',
          title: '정책 변경 사항',
          src: 'pages/rist-phase2-policy-changes.html',
          width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-copy-improvements',
          title: '문구 개선',
          src: 'pages/rist-phase2-copy-improvements.html',
          width: 1280,
          autoHeight: true,
          summary: '',
          hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-duplicate-filename',
          title: '동일 파일명 확인',
          src: 'pages/rist-phase2-duplicate-filename.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-profile-menu',
          title: '프로필 메뉴(2차 개선)',
          src: 'pages/rist-phase2-profile-menu.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-review-preparation',
          title: '데이터 검토: 1단계',
          src: 'pages/rist-phase2-review-preparation.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-review-detail',
          title: '데이터 검토: 2단계',
          src: 'pages/rist-phase2-review-detail.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-final-validation',
          title: '최종 저장 전 통합 검사',
          src: 'pages/rist-phase2-final-validation.html',
          width: 1280, height: 800, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-phase2-nas-deduplication',
          title: 'NAS 보관 시 중복 데이터 검사',
          src: 'pages/rist-phase2-nas-deduplication.html',
          width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true
        },
      ]
    },
    {
      id: 'rist-phase25',
      title: '화면 기획서(2.5차 개선)',
      children: [
        { id: 'rist-phase25-cover', title: '표지', src: 'pages/rist-phase25-cover.html', width: 1280, height: 800, summary: '', hideEmptyDescription: true },
        { id: 'rist-phase25-change-history', title: '변경 히스토리', src: 'pages/rist-phase25-change-history.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true },
        { id: 'rist-phase25-policy-changes', title: '정책 변경 사항', src: 'pages/rist-phase25-policy-changes.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true },
      ]
    },
    {
      id: 'rist-phase3',
      title: '화면 기획서(3차 개선)',
      children: [
        { id: 'rist-phase3-policy-changes', title: '정책 변경 사항', src: 'pages/rist-phase3-policy-changes.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true },
        { id: 'rist-phase3-ui-changes', title: 'UI 변경 사항', src: 'pages/rist-phase3-ui-changes.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true },
        { id: 'rist-phase3-upload-history', title: '업로드 이력', src: 'pages/rist-phase3-upload-history.html', width: 1280, height: 800, summary: '' },
        { id: 'rist-phase3-history-review', title: '이력 상세(검토 중)', src: 'pages/rist-phase3-history-review.html', width: 1280, height: 800, summary: '' },
        { id: 'rist-phase3-history-complete', title: '이력 상세(최종 저장 완료)', src: 'pages/rist-phase3-history-complete.html', width: 1280, height: 800, summary: '' },
        { id: 'rist-phase3-history-expired', title: '이력 상세(보관 기간 만료)', src: 'pages/rist-phase3-history-expired.html', width: 1280, height: 800, summary: '' },
        { id: 'rist-phase3-history-failed', title: '이력 상세(추출 실패)', src: 'pages/rist-phase3-history-failed.html', width: 1280, height: 800, summary: '' }
      ]
    },
{
  "id": "rist-phase35",
  "title": "화면 기획서(3.5차 개선)",
  "children": [
    {
      "id": "rist-phase35-extraction-excel-partial",
      "title": "추출 실패 안내(Excel 일부 실패)",
      "src": "pages/rist-phase35-extraction-excel-partial.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase35-extraction-pdf-partial",
      "title": "추출 실패 안내(PDF 일부 실패)",
      "src": "pages/rist-phase35-extraction-pdf-partial.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    }
  ]
},
    {
  "id": "rist-phase4",
  "title": "화면 기획서(여러 파일 업로드)",
  "children": [
    {
      "id": "rist-phase4-policy-changes",
      "title": "정책 변경 사항",
      "src": "pages/rist-phase4-policy-changes.html",
      "width": 1280,
      "autoHeight": true,
      "hideEmptyDescription": true
    },
    {
      "id": "rist-phase4-multi-upload-policy",
      "title": "여러 파일 업로드 정책",
      "src": "pages/rist-phase4-multi-upload-policy.html",
      "width": 1280,
      "autoHeight": true,
      "hideEmptyDescription": true
    },
    {
      "id": "rist-phase4-group-storage-policy",
      "title": "그룹 저장 및 원본 다운로드 정책",
      "src": "pages/rist-phase4-group-storage-policy.html",
      "width": 1280,
      "autoHeight": true,
      "hideEmptyDescription": true
    },
    {
      "id": "rist-phase4-ui-changes",
      "title": "UI 변경 사항",
      "src": "pages/rist-phase4-ui-changes.html",
      "width": 1280,
      "autoHeight": true,
      "hideEmptyDescription": true
    },
    {
      "id": "rist-phase4-upload-single",
      "title": "파일 업로드 변경 사항",
      "src": "pages/rist-phase4-upload-single.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-single-selected",
      "title": "파일 업로드(단일 파일 선택)",
      "src": "pages/rist-phase4-upload-single-selected.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-multiple-selected",
      "title": "파일 업로드(여러 파일 선택)",
      "src": "pages/rist-phase4-upload-multiple-selected.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-analyzing",
      "title": "여러 파일 업로드(유형 분석 중)",
      "src": "pages/rist-phase4-upload-analyzing.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-analyzed",
      "title": "여러 파일 업로드(유형 분석 완료)",
      "src": "pages/rist-phase4-upload-analyzed.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-duplicates",
      "title": "여러 파일 업로드(중복 안내)",
      "src": "pages/rist-phase4-upload-duplicates.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-excluded",
      "title": "여러 파일 업로드(제외 후)",
      "src": "pages/rist-phase4-upload-excluded.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-upload-partial-error",
      "title": "여러 파일 업로드(일부 처리 불가)",
      "src": "pages/rist-phase4-upload-partial-error.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-preparation-first",
      "title": "1단계(첫 파일)",
      "src": "pages/rist-phase4-review-preparation-first.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-preparation-middle",
      "title": "1단계(중간 파일)",
      "src": "pages/rist-phase4-review-preparation-middle.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-file-list",
      "title": "1단계(파일 목록)",
      "src": "pages/rist-phase4-review-file-list.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-detail-first",
      "title": "2단계(첫 파일)",
      "src": "pages/rist-phase4-review-detail-first.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-detail-middle",
      "title": "2단계(중간 파일)",
      "src": "pages/rist-phase4-review-detail-middle.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-group-checking",
      "title": "그룹 전체 검사 진행",
      "src": "pages/rist-phase4-group-checking.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-errors-popup",
      "title": "3단계(오류 팝업)",
      "src": "pages/rist-phase4-review-errors-popup.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-error-first",
      "title": "3단계(첫 오류 파일)",
      "src": "pages/rist-phase4-review-error-first.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-error-next",
      "title": "3단계(다음 오류 파일)",
      "src": "pages/rist-phase4-review-error-next.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-group-confirm",
      "title": "그룹 최종 저장 확인",
      "src": "pages/rist-phase4-group-confirm.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-group-saving",
      "title": "그룹 저장 중",
      "src": "pages/rist-phase4-group-saving.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-group-save-failed",
      "title": "그룹 저장 실패",
      "src": "pages/rist-phase4-group-save-failed.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-group-saved",
      "title": "그룹 저장 완료",
      "src": "pages/rist-phase4-group-saved.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-review-next-group",
      "title": "다음 유형 그룹(1단계)",
      "src": "pages/rist-phase4-review-next-group.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-all-groups-complete",
      "title": "모든 그룹 완료",
      "src": "pages/rist-phase4-all-groups-complete.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-menu",
      "title": "이력 진입 메뉴",
      "src": "pages/rist-phase4-history-menu.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-bundle-history",
      "title": "업로드 이력(여러 파일)",
      "src": "pages/rist-phase4-bundle-history.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-bundle-partial",
      "title": "묶음 상세(일부 완료)",
      "src": "pages/rist-phase4-bundle-partial.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-bundle-expiring",
      "title": "묶음 상세(만료 예정)",
      "src": "pages/rist-phase4-bundle-expiring.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-bundle-expired",
      "title": "묶음 상세(일부 만료)",
      "src": "pages/rist-phase4-bundle-expired.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-bundle-complete",
      "title": "묶음 상세(전체 완료)",
      "src": "pages/rist-phase4-bundle-complete.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-group-review",
      "title": "그룹 상세(검토 중)",
      "src": "pages/rist-phase4-history-group-review.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-group-complete",
      "title": "그룹 상세(완료)",
      "src": "pages/rist-phase4-history-group-complete.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-group-expired",
      "title": "그룹 상세(만료)",
      "src": "pages/rist-phase4-history-group-expired.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-file-failed",
      "title": "파일 상세(추출 실패)",
      "src": "pages/rist-phase4-history-file-failed.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-file-unsupported",
      "title": "파일 상세(지원하지 않는 파일)",
      "src": "pages/rist-phase4-history-file-unsupported.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-single-upload-history",
      "title": "업로드 이력(단일 파일)",
      "src": "pages/rist-phase4-single-upload-history.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-single-history-failed",
      "title": "단일 파일 이력 상세(추출 실패)",
      "src": "pages/rist-phase4-single-history-failed.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-single-history-unsupported",
      "title": "단일 파일 이력 상세(지원하지 않는 파일)",
      "src": "pages/rist-phase4-single-history-unsupported.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-delete-single",
      "title": "이력 삭제 확인(단일 파일)",
      "src": "pages/rist-phase4-history-delete-single.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    },
    {
      "id": "rist-phase4-history-delete-multiple",
      "title": "이력 삭제 확인(여러 파일)",
      "src": "pages/rist-phase4-history-delete-multiple.html",
      "width": 1280,
      "height": 800,
      "summary": ""
    }
  ]
},
    {
      id: 'policies',
      title: '정책',
      children: [
        { id: 'rist-failed-upload-history-deletion-policy', title: '실패 파일 업로드 이력 삭제 정책', src: 'pages/rist-failed-upload-history-deletion-policy.html', width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true },
        {
          id: 'rist-policies',
          title: '정책 문서',
          src: 'pages/rist-policies.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · 정책 문서',
          summary: '프로그램에 적용되는 정책과 운영 기준을 항목별로 정리합니다.'
        },
        {
          id: 'rist-storage-original-download-policy',
          title: '저장 및 원본 다운로드 정책',
          src: 'pages/rist-storage-original-download-policy.html',
          width: 1280, autoHeight: true, summary: '', hideEmptyDescription: true
        },
        {
          id: 'rist-schema',
          title: '통합 스키마',
          src: 'pages/rist-schema.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · 스키마 문서',
          summary: '데이터 저장에 필요한 테이블·컬럼·관계·제약 조건'
        },
        {
          id: 'rist-policy-link-example',
          title: '기본 순서도',
          src: 'pages/rist-policy-link-example.html',
          width: 1280,
          height: 800,
          autoHeight: true,
          kind: 'RIST · 사용자 흐름',
          summary: '로그인부터 파일 업로드, 입력·검토, 최종 저장과 이력 조회까지의 기본 흐름'
        },
        {
          id: 'rist-llm-flow',
          title: 'LLM 추출 순서도',
          src: 'pages/rist-llm-flow.html',
          width: 1280,
          height: 800,
          autoHeight: true,
          kind: 'RIST · 고도화',
          summary: '유형을 자동 확정하지 못한 파일의 LLM 추출, 결과 검증과 사용자 검토 흐름'
        }
      ]
    },
    {
      id: 'extraction-rules',
      title: '추출 규칙',
      children: window.MOCKUP_VIEWER_EXTRACTION_RULE_PAGES || []
    },
    {
      id: 'matching-rules',
      title: '매칭 규칙',
      children: window.MOCKUP_VIEWER_MATCHING_RULE_PAGES || []
    },
    {
      id: 'db-lists',
      title: 'DB 리스트',
      children: window.MOCKUP_VIEWER_DB_LIST_PAGES || []
    },
    {
      id: 'viewer-guide',
      title: '뷰어 안내',
      children: [
        {
          id: 'viewer-overview',
          title: '공통 뷰어 안내',
          src: 'pages/viewer-overview.html',
          width: 1280,
          height: 800,
          kind: '뷰어 안내 · 예시 화면',
          summary: '페이지 탐색, 패널 표시, 목업 확대·이동, 설명 확인과 텍스트·코드 복사 방법을 안내합니다.'
        },
        {
          id: 'annotation-example',
          title: '설명 번호 예시',
          src: 'pages/annotation-example.html',
          width: 1280,
          height: 800,
          kind: '뷰어 안내 · 예시 화면',
          summary: '화면의 번호와 오른쪽 설명이 연결되는 예시입니다. 번호를 선택하면 해당 설명이 강조됩니다.'
        },
        {
          id: 'long-page-example',
          title: '긴 화면 예시',
          src: 'pages/long-page-example.html',
          width: 1280,
          height: 2400,
          kind: '뷰어 안내 · 예시 화면',
          summary: '아래로 이어지는 화면을 살펴보는 예시입니다. 스크롤하거나 스페이스키를 누른 채 드래그해 화면을 이동할 수 있습니다.'
        }
      ]
    }
  ]
};
