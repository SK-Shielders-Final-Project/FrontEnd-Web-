// src/admin/pages/BikesPage.js
import React, { useEffect, useMemo, useState } from "react";
import { fetchBikes, updateBikeStatus } from "../api/bikeApi";
import { BIKE_STATUS_OPTIONS_KO, makeBikeLabel, statusKoFromCode } from "../utils/bikeStatus";

export default function BikesPage() {
  const [q, setQ] = useState("");
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  // ✅ 최초 진입 시 목록 API 호출
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErrMsg("");
      setOkMsg("");

      try {
        const list = await fetchBikes();

        // 화면에서 쓰기 쉬운 형태로 변환
        // 백엔드 응답: bike_id, serial_number, model_name, status_code, status(한글)
        const mapped = (Array.isArray(list) ? list : []).map((b) => ({
          id: b.bike_id,
          label: makeBikeLabel(b),
          model: b.model_name || "",
          statusKo: b.status || statusKoFromCode(b.status_code),
          raw: b,
        }));

        if (alive) setBikes(mapped);
      } catch (e) {
        if (alive) setErrMsg(e.message || "목록 조회 중 오류");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return bikes;
    const keyword = q.trim().toLowerCase();
    return bikes.filter((b) => (b.label || "").toLowerCase().includes(keyword));
  }, [q, bikes]);

  // ✅ 상태 변경: 낙관적 업데이트 + 실패 롤백 + 서버 응답 반영
  async function changeStatus(bikeId, nextStatusKo) {
    setErrMsg("");
    setOkMsg("");

    const prev = bikes;

    // 1) UI 낙관적 업데이트
    setBikes((list) =>
      list.map((b) => (b.id === bikeId ? { ...b, statusKo: nextStatusKo } : b))
    );

    setSavingId(bikeId);

    try {
      const updated = await updateBikeStatus(bikeId, nextStatusKo);
      // updated: { bike_id, status(한글), updated_at }

      // 2) 서버 응답 기준으로 확정 반영 (서버가 최종 status 내려줌)
      setBikes((list) =>
        list.map((b) =>
          b.id === updated.bike_id ? { ...b, statusKo: updated.status } : b
        )
      );

      setOkMsg(`상태가 "${updated.status}"로 변경되었습니다. (${updated.updated_at})`);
    } catch (e) {
      // 실패하면 롤백
      setBikes(prev);
      setErrMsg(e.message || "상태 변경 중 오류");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return React.createElement("div", null, "로딩중...");
  }

  return React.createElement(
    "div",
    null,

    React.createElement("h3", null, "자전거 리스트"),

    errMsg
      ? React.createElement("div", { style: { color: "crimson", marginBottom: 8 } }, errMsg)
      : null,

    okMsg
      ? React.createElement("div", { style: { color: "green", marginBottom: 8 } }, okMsg)
      : null,

    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, marginBottom: 12 } },
      React.createElement("input", {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "조회/검색 (예: BIKE-001 또는 시리얼)",
        style: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", flex: 1 },
      }),
      React.createElement(
        "button",
        {
          type: "button",
          // 검색 버튼은 지금 입력 필터가 실시간이라 기능상 필요 없음. UI용으로 둠.
          style: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#fff" },
        },
        "검색"
      )
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
          React.createElement("th", { style: tableStyles.th }, "ID"),
          React.createElement("th", { style: tableStyles.th }, "LABEL"),
          React.createElement("th", { style: tableStyles.th }, "STATUS"),
          React.createElement("th", { style: tableStyles.th }, "상태 수정")
        )
      ),
      React.createElement(
        "tbody",
        null,
        filtered.map((b) =>
          React.createElement(
            "tr",
            { key: b.id },
            React.createElement("td", { style: tableStyles.td }, String(b.id)),
            React.createElement("td", { style: tableStyles.td }, b.label),
            React.createElement("td", { style: tableStyles.td }, b.statusKo),
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement(
                "select",
                {
                  value: b.statusKo,
                  disabled: savingId === b.id,
                  onChange: (e) => changeStatus(b.id, e.target.value),
                  style: tableStyles.select,
                },
                BIKE_STATUS_OPTIONS_KO.map((s) =>
                  React.createElement("option", { key: s, value: s }, s)
                )
              ),
              savingId === b.id
                ? React.createElement("span", { style: { marginLeft: 10, fontSize: 12, color: "#666" } }, "저장중...")
                : null
            )
          )
        )
      )
    )
  );
}

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" },
  th: { borderBottom: "1px solid #ddd", padding: 10, textAlign: "left", background: "#f5f5f5" },
  td: { borderBottom: "1px solid #eee", padding: 10 },
  select: { padding: "6px 8px", borderRadius: 6, border: "1px solid #ccc", background: "#fff" },
};
