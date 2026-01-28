src/admin/api/inquiryApi.js 파일이 성공적으로 생성되었습니다.

**수정 요약:**

1.  **새 파일 생성:** `src/admin/api/inquiryApi.js` 파일을 생성했습니다. 이 파일에는 관리자 전용 문의사항 API 호출을 위한 함수들이 포함되어 있습니다.
    *   이 파일은 `src/api/axiosConfig.js`의 `apiClient`를 임포트하여 사용하므로, 관리자 토큰(adminToken)이 자동으로 요청 헤더에 포함되고, 토큰 갱신 로직도 자동으로 처리됩니다.
    *   관리자 전용 백엔드 엔드포인트(예: `/api/admin/inquiry/list`, `/api/admin/inquiry/reply` 등)를 가정하여 API 함수들을 구현했습니다.
2.  **`src/admin/pages/InquiriesPage.js`:**
    *   이 파일의 임포트 구문 `../api/inquiryApi`는 이제 새로 생성된 `src/admin/api/inquiryApi.js` 파일을 참조하게 됩니다. 따라서 `InquiriesPage.js` 파일 자체의 임포트 코드는 수정할 필요가 없습니다.
    *   결과적으로, `InquiriesPage.js`에서 호출하는 모든 문의사항 관련 API 함수들은 이제 관리자 전용 엔드포인트를 호출하며, `adminToken`을 통한 권한 검증이 자동으로 이루어집니다.
3.  **`src/api/inquiryApi.js` 및 `src/inquiry/InquiryPage.js`:**
    *   이 파일들은 기존대로 `apiClient`를 사용하여 사용자 문의사항 API를 호출하므로, **수정할 필요가 없습니다.**

**주의사항:**

*   새로 정의된 `/api/admin/inquiry` 경로를 포함하는 **백엔드 API 엔드포인트들이 서버에 실제로 구현되어 있어야 합니다.** 그렇지 않으면 프런트엔드에서 요청을 보내더라도 서버에서 올바르게 처리되지 않습니다.
*   `adminLevel` 파라미터는 API 요청 본문에 포함되도록 구현되었지만, 백엔드에서 이 값을 실제로 어떻게 활용할지는 서버 구현에 따라 달라집니다.

이제 프런트엔드 코드 측면에서 관리자 문의사항 관련 토큰 검증 및 API 라우팅 분리 작업이 완료되었습니다.