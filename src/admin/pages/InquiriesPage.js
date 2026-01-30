import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllInquiries,
  fetchInquiryDetail,
  writeAdminReply,
  deleteInquiry,
  downloadFile,
} from "../api/inquiryApi";
import "./InquiriesPage.css";

// 날짜 렌더링 형식 수정 (YYYY-MM-DD HH:mm:ss)
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export default function InquiriesPage() {
  const adminLevel = Number(localStorage.getItem("adminLevel") ?? 1);

  const [list, setList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [listLoading, setListLoading] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadList = useCallback(async (p) => {
    setListLoading(true);
    try {
      const data = await fetchAllInquiries(adminLevel, p);
      const content = Array.isArray(data) ? data : (data.content || []);
      setList(content);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? (Array.isArray(data) ? data.length : 0));
      setPage(data.number ?? 0);
    } catch (e) {
      alert(e.response?.data?.message || e.message || "문의 목록을 불러오지 못했습니다.");
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, [adminLevel]);

  useEffect(() => {
    loadList(page);
  }, [adminLevel, page, loadList]);

  const loadDetail = useCallback(
    async (inquiryId) => {
      if (!inquiryId) {
        setDetail(null);
        return;
      }
      setDetailLoading(true);
      try {
        const data = await fetchInquiryDetail(adminLevel, inquiryId);
        setDetail(data);
        setReplyText(data?.admin_reply ?? "");
      } catch (e) {
        alert(e.response?.data?.message || e.message || "문의 상세를 불러오지 못했습니다.");
        setDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [adminLevel]
  );

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const handleSelectItem = (inquiryId) => {
    setSelectedId(inquiryId);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await writeAdminReply(adminLevel, selectedId, replyText.trim());
      await loadDetail(selectedId);
      await loadList(page);
    } catch (e) {
      alert(e.response?.data?.message || e.message || "답변 등록에 실패했습니다.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!window.confirm("이 문의를 삭제하시겠습니까?")) return;
    try {
      await deleteInquiry(adminLevel, selectedId);
      setSelectedId(null);
      setDetail(null);
      setPage(0);
      loadList(0);
    } catch (e) {
      alert(e.response?.data?.message || e.message || "삭제에 실패했습니다.");
    }
  };

  const handleDownload = (item) => {
    let fileParam = "";
    if (item?.path && item?.fileName) {
        const ext = item.ext ? `.${item.ext}` : "";
        fileParam = `${item.path}/${item.fileName}${ext}`;
    } else {
        fileParam = item?.file || item?.file_name || item?.original_filename || 
                    item?.image_url || (item?.file_id != null ? String(item.file_id) : "");
    }

    if (!fileParam) {
      alert("다운로드할 파일 정보가 없습니다.");
      return;
    }

    downloadFile(fileParam, adminLevel).catch((e) =>
      alert(e.message || "다운로드에 실패했습니다.")
    );
  };

  const hasFile = (item) =>
    (item?.file && String(item.file).trim()) ||
    (item?.path && item?.fileName) ||
    (item?.image_url && String(item.image_url).trim()) ||
    (item?.file_id != null && item?.file_id !== "");

  return (
    <div className="admin-inquiries-page">
      <h2>문의 사항 전체 조회</h2>

      <div className="admin-inquiries-grid">
        <div className="admin-inquiries-list">
          <h3 className="admin-inquiries-list-title">문의 목록 (총 {totalElements}건)</h3>
          <div className="admin-inquiries-list-inner">
            {listLoading ? (
              <div className="admin-inquiries-loading">불러오는 중...</div>
            ) : list.length === 0 ? (
              <div className="admin-inquiries-empty">등록된 문의가 없습니다.</div>
            ) : (
              list.map((item) => (
                <div
                  key={item.inquiry_id}
                  className={`admin-inquiry-card ${selectedId === item.inquiry_id ? "active" : ""}`}
                  onClick={() => handleSelectItem(item.inquiry_id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectItem(item.inquiry_id);
                    }
                  }}
                >
                  <h4>{item.title || "(제목 없음)"}</h4>
                  <div className="admin-inquiry-card-meta">
                    {/* user_id로 렌더링 */}
                    {formatDate(item.created_at)} · user_id: {item.user_id || "알 수 없음"}
                  </div>
                  {item.admin_reply && (
                    <span className="reply-status-badge">답변완료</span>
                  )}
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="admin-inquiries-pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page <= 0 || listLoading}
              >
                이전
              </button>
              <span style={{ padding: "0 8px", fontSize: 14 }}>
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || listLoading}
              >
                다음
              </button>
            </div>
          )}
        </div>

        <div className="admin-inquiries-detail">
          {!selectedId && (
            <div className="admin-inquiries-detail-placeholder">
              왼쪽 목록에서 문의를 선택하세요.
            </div>
          )}

          {selectedId && detailLoading && (
            <div className="admin-inquiries-loading">상세 불러오는 중...</div>
          )}

          {selectedId && !detailLoading && detail && (
            <>
              <h3>{detail.title || "(제목 없음)"}</h3>
              <div className="admin-inquiries-detail-meta">
                작성일: {formatDate(detail.created_at)}
                {detail.updated_at && ` · 수정일: ${formatDate(detail.updated_at)}`}
                {/* 상세 영역도 user_id로 렌더링 */}
                {" · "}user_id: {detail.user_id || "알 수 없음"}
              </div>
              {detail.content && /<[a-z][\s\S]*>/i.test(detail.content) ? (
                <div
                  className="admin-inquiries-detail-content admin-inquiries-detail-content-html"
                  dangerouslySetInnerHTML={{ __html: detail.content }}
                />
              ) : (
                <div className="admin-inquiries-detail-content">
                  {detail.content || "-"}
                </div>
              )}

              {hasFile(detail) && (
                <div className="admin-inquiries-detail-file">
                  <button
                    type="button"
                    onClick={() => handleDownload(detail)}
                  >
                    첨부파일 다운로드 ({detail.originalName || detail.original_filename || "파일"})
                  </button>
                </div>
              )}

              {detail.admin_reply && (
                <div className="admin-inquiries-detail-reply">
                  <h4>관리자 답변</h4>
                  <p>{detail.admin_reply}</p>
                </div>
              )}

              <form className="admin-inquiries-reply-form" onSubmit={handleSubmitReply} style={{ marginTop: 16 }}>
                <label htmlFor="admin-reply-input">
                  {detail.admin_reply ? "답변 수정" : "답변 작성"}
                </label>
                <textarea
                  id="admin-reply-input"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답변 내용을 입력하세요"
                  style={{ display: "block", marginTop: 6 }}
                  rows={4}
                />
                <div className="admin-inquiries-actions" style={{ marginTop: 10 }}>
                  <button
                    type="submit"
                    className="inquiry-btn primary"
                    disabled={replySubmitting || !replyText.trim()}
                  >
                    {replySubmitting ? "등록 중..." : "답변 저장"}
                  </button>
                </div>
              </form>

              <div className="admin-inquiries-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="inquiry-btn danger"
                  onClick={handleDelete}
                >
                  문의 삭제
                </button>
              </div>
            </>
          )}

          {selectedId && !detailLoading && !detail && (
            <div className="admin-inquiries-empty">해당 문의를 불러올 수 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}