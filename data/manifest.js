/* 트리 순서대로 표시하며, 페이지 번호와 하단 이동은 최상위 목록별로 구분합니다.
 * 그룹: { id, title, children: [...] }
 * 페이지: { id, title, src, width, height, summary, kind, autoHeight? }
 * autoHeight는 data-document-root를 가진 문서의 실제 높이를 사용합니다.
 * 페이지 ID는 순서와 무관한 고유 값으로 유지합니다. src는 프로젝트 내부 HTML 상대 경로입니다.
 */
window.MOCKUP_VIEWER_MANIFEST = {
  title: '화면 기획서: RIST 데이터 표준화 프로그램',
  tree: [
    {
      id: 'rist',
      title: '화면 기획서',
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
          id: 'rist-login',
          title: '로그인',
          src: 'pages/rist-login.html',
          width: 1280,
          height: 800,
          kind: 'RIST · U-01',
          summary: '사용자 인증'
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
          id: 'rist-review-preparation',
          title: '데이터 검토: 1단계',
          src: 'pages/rist-review-preparation.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · U-04',
          summary: '추출된 항목 확인, 미추출 항목 입력 및 위치 확인'
        },
        {
          id: 'rist-review-detail',
          title: '데이터 검토: 2단계',
          src: 'pages/rist-review-detail.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · U-04',
          summary: '물질별 통합 데이터 검토, 개별·일괄 수정 및 최종 저장'
        },
        {
          id: 'rist-review-detail-55',
          title: '데이터 검토: 2단계(55행)',
          src: 'pages/rist-review-detail-55.html',
          width: 1280,
          autoHeight: true,
          kind: 'RIST · U-04',
          summary: '50행 추가 조회 후 총 55행의 데이터와 표 내부 세로 스크롤'
        }
      ]
    },
    {
      id: 'policies',
      title: '정책',
      children: [
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
