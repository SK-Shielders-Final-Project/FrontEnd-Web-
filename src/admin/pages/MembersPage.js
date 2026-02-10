import React, { useEffect, useState } from "react";
import { fetchMembers, updateMemberRole } from "../api/memberApi";
import { getCookie } from "../../utils/cookie";
import api from '../../api/axiosConfig'; // Import the API client

// 드롭다운 옵션
const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"];

// 임시 관리자 ID (로그인 붙이면 교체)
function getAdminId() {
  const adminId = getCookie('adminId');
  return adminId ? parseInt(adminId, 10) : null;
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdatingSelectedMembers, setIsUpdatingSelectedMembers] = useState(false); // State for the selected members button
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set()); // State to store selected member IDs

  // ✅ 1) 회원 목록 불러오기 (memberApi.js 사용)
  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setError("");
        const list = await fetchMembers(); // ✅ 여기서 API 호출
        if (alive) setMembers(list);
      } catch (e) {
        console.error(e);
        if (alive) {
          setMembers([]);
          setError("회원 목록 조회 실패");
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ 2) 권한 수정 (memberApi.js 사용)
  async function onChangeRole(userId, nextRole) {
    setError("");
    setSuccess("");

    // UI 낙관적 업데이트용: 이전 상태 백업
    const prev = members;

    // ✅ 먼저 화면에서 바꿔보이게(낙관적 업데이트)
    setMembers((list) =>
      list.map((m) => (m.id === userId ? { ...m, role: nextRole } : m))
    );

    setSavingId(userId);

    try {
      // ✅ 여기서 result를 "정의"해서 result undefined 에러 해결
      const result = await updateMemberRole(getAdminId(), userId, nextRole);

      // ✅ 서버 응답 기준으로 동기화
      setMembers((list) =>
        list.map((m) =>
          m.id === result.user_id ? { ...m, role: result.role } : m
        )
      );

      setSuccess("권한이 성공적으로 수정되었습니다.");
    } catch (e) {
      console.error(e);
      // 실패 시 롤백
      setMembers(prev);
      const errorMessage = e.response?.data?.error || e.message || "권한 수정 실패";
      alert(errorMessage); // Display alert with the error message
      setError(errorMessage);
    } finally {
      setSavingId(null);
    }
  }

  // Handle checkbox changes
  const handleCheckboxChange = (memberId) => {
    setSelectedMemberIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(memberId)) {
        newSelected.delete(memberId);
      } else {
        newSelected.add(memberId);
      }
      return newSelected;
    });
  };

  // New function to handle updating selected members to admin
  async function handleUpdateSelectedMembersToAdmin() {
    if (selectedMemberIds.size === 0) {
      alert("선택된 사용자가 없습니다.");
      return;
    }

    setIsUpdatingSelectedMembers(true);
    setError("");
    setSuccess("");
    try {
      // As per user's instruction, API call remains generic without passing selected IDs
      await api.post("/api/admin/staff/update-properties", {
        configName: "selectedUserRoles", // Changed configName to reflect selected users
        configValue: "ADMIN",
        // selectedUserIds: Array.from(selectedMemberIds) // Not sending to backend as per instruction
      });
      // setSuccess("선택한 사용자의 권한을 ADMIN으로 변경 요청 완료.");
    } catch (e) {
      console.error("Failed to update selected members to admin:", e);
      const errorMessage = e.response?.data?.error || e.message || "선택한 사용자의 권한 변경 실패";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUpdatingSelectedMembers(false);
    }
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "회원 정보 리스트 조회"),

    React.createElement(
      "button",
      {
        onClick: handleUpdateSelectedMembersToAdmin,
        disabled: isUpdatingSelectedMembers || selectedMemberIds.size === 0,
        style: { marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#3FC2EC', color: 'white', border: 'none', borderRadius: '5px' }
      },
      isUpdatingSelectedMembers ? "선택한 사용자 권한 변경 중..." : "선택한 사용자 권한 ADMIN으로 변경"
    ),

    error &&
      React.createElement(
        "div",
        { style: { color: "crimson", marginBottom: 8 } },
        error
      ),

    success &&
      React.createElement(
        "div",
        { style: { color: "green", marginBottom: 8 } },
        success
      ),

    React.createElement(
      "table",
      { style: tableStyles.table },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          [
            "선택", // New column for checkbox
            "ID",
            "USERNAME",
            "NAME",
            "EMAIL",
            "PHONE",
            "ROLE",
            "권한 수정",
          ].map((h) =>
            React.createElement("th", { key: h, style: tableStyles.th }, h)
          )
        )
      ),
      React.createElement(
        "tbody",
        null,
        members.map((m) =>
          React.createElement(
            "tr",
            { key: m.id },
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement("input", {
                type: "checkbox",
                checked: selectedMemberIds.has(m.id),
                onChange: () => handleCheckboxChange(m.id),
              })
            ),
            React.createElement("td", { style: tableStyles.td }, String(m.id)),
            React.createElement("td", { style: tableStyles.td }, m.userName),
            React.createElement("td", { style: tableStyles.td }, m.name),
            React.createElement("td", { style: tableStyles.td }, m.email),
            React.createElement("td", { style: tableStyles.td }, m.phone),
            React.createElement("td", { style: tableStyles.td }, m.role),
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement(
                "select",
                {
                  value: m.role,
                  disabled: savingId === m.id,
                  onChange: (e) => onChangeRole(m.id, e.target.value),
                },
                ROLE_OPTIONS.map((r) =>
                  React.createElement("option", { key: r, value: r }, r)
                )
              ),
              savingId === m.id &&
                React.createElement(
                  "span",
                  { style: { marginLeft: 8, fontSize: 12 } },
                  "저장중..."
                )
            )
          )
        )
      )
    )
  );
}

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: { padding: 10, background: "#f5f5f5", textAlign: "left" },
  td: { padding: 10, borderBottom: "1px solid #eee" },
};
