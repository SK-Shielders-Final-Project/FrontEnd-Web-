import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import {
  fetchMyInquiries,
  fetchInquiryDetail,
  writeInquiry,
  updateInquiry,
  deleteInquiry,
  downloadFile,
  viewFile,
  uploadImageFile,
  uploadAttachmentFile,
} from '../api/inquiryApi';
import axios from 'axios';
import './InquiryPage.css';

// --- 외부 스크립트/스타일 로드 유틸리티 ---
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = reject;
    document.body.appendChild(el);
  });
}

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    el.onload = () => resolve();
    el.onerror = reject;
    document.head.appendChild(el);
  });
}

// 텍스트를 HTML 안전 문자로 변환
const escapeHtml = (text) => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const SUMMERNOTE_CDN = 'https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist';

function ensureSummernote() {
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.summernote) {
    return Promise.resolve();
  }
  return loadScript('https://code.jquery.com/jquery-3.7.1.min.js')
    .then(() => loadStyle('https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css'))
    .then(() => loadScript('https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js'))
    .then(() => loadStyle(`${SUMMERNOTE_CDN}/summernote-bs4.min.css`))
    .then(() => loadScript(`${SUMMERNOTE_CDN}/summernote-bs4.min.js`))
    .then(() => loadScript(`${SUMMERNOTE_CDN}/lang/summernote-ko-KR.min.js`));
}

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function InquiryPage() {
  const { isLoggedIn, userId } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAttachFile, setFormAttachFile] = useState(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // 중복 렌더링 방지용 Ref
  const processedUrls = useRef(new Set());

  const loadList = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchMyInquiries(userId);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.response?.data?.message || e.message || '목록 로드 실패');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadDetail = useCallback(async (inquiryId) => {
    if (!inquiryId) {
      setDetail(null);
      return;
    }
    try {
      const data = await fetchInquiryDetail(inquiryId);
      setDetail(data);
    } catch (e) {
      alert(e.response?.data?.message || e.message || '상세 로드 실패');
      setDetail(null);
    }
  }, []);

  useEffect(() => {
    if (userId) loadList();
  }, [userId, loadList]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const isEditorActive = formMode === 'write' || formMode === 'edit';

  useEffect(() => {
    if (!isEditorActive || !editorRef.current) return;
    let cancelled = false;
    processedUrls.current.clear();

    ensureSummernote().then(() => {
      if (cancelled || !editorRef.current || !window.jQuery) return;
      const $ = window.jQuery;

      $(editorRef.current).summernote({
        placeholder: '내용을 입력하세요.',
        height: 300,
        lang: 'ko-KR',
        callbacks: {
          onImageUpload: (files) => {
            uploadImageFile(files[0]).then(url => $(editorRef.current).summernote('insertImage', url));
          },
          onKeyup: function(e) {
            if (e.keyCode === 13) { 
              const rawHtml = $(editorRef.current).summernote('code');
              const plainText = rawHtml.replace(/<\/?[^>]+(>|$)/g, " ").trim();
              const decodedText = decodeHtml(plainText);
              
              const urlRegex = /(https?:\/\/[^\s<>"]+)/g;
              const matches = decodedText.match(urlRegex);
              
              if (matches && matches.length > 0) {
                let lastUrl = matches[matches.length - 1].replace(/&amp;/g, '&').replace(/&nbsp;/g, '').trim();
                
                if (processedUrls.current.has(lastUrl)) return;
                processedUrls.current.add(lastUrl);

                // [수정] GET 방식 호출 및 새로운 데이터 구조(image 포함) 반영
                axios.get(`/api/scrap?url=${encodeURIComponent(lastUrl)}`)
                  .then(res => {
                    if (editorRef.current && $(editorRef.current).data('summernote')) {
                      const { title, description, url, image } = res.data;
                      
                      // 사진과 동일한 네이버 스타일 미리보기 카드 레이아웃
                      const previewHtml = `
                        <div class="link-preview-card" style="display: flex; border: 1px solid #e1e1e1; margin: 10px 0; background: #fff; max-width: 750px; text-decoration: none; font-family: 'Malgun Gothic', sans-serif; overflow: hidden; border-radius: 2px; cursor: pointer; user-select: none;">
                          <div class="preview-image-wrap" style="flex: 0 0 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; border-right: 1px solid #f1f1f1;">
                            <img src="${image || 'https://via.placeholder.com/200x120?text=No+Image'}" 
                                 alt="Preview" 
                                 style="width: 100%; height: auto; object-fit: cover; display: block;"/>
                          </div>
                          
                          <div class="preview-text-wrap" style="flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
                            <div style="font-size: 17px; font-weight: bold; color: #000; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${escapeHtml(title || '제목 없음')}
                            </div>
                            <div style="font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                              ${escapeHtml(description || '내용 요약 정보가 없습니다.')}
                            </div>
                            <div style="font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${escapeHtml(url)}
                            </div>
                          </div>
                        </div>
                        <p><br></p>`;
                      
                      $(editorRef.current).summernote('focus');
                      $(editorRef.current).summernote('pasteHTML', previewHtml);
                    }
                  })
                  .catch(err => {
                    console.error("❌ Scraping Failed:", err.response?.status);
                    processedUrls.current.delete(lastUrl);
                  });
              }
            }
          }
        }
      });
      if (formMode === 'edit' && formContent) {
        $(editorRef.current).summernote('code', formContent);
      }
    });
    return () => { 
        cancelled = true; 
        if(window.jQuery && editorRef.current) window.jQuery(editorRef.current).summernote('destroy');
    };
  }, [isEditorActive, formMode]);

  // 이하 resetForm 및 기존 핸들러 로직 동일
  const resetForm = () => {
    setFormMode(null);
    setFormTitle('');
    setFormContent('');
    setFormAttachFile(null);
    processedUrls.current.clear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getEditorContent = () => {
    if (editorRef.current && window.jQuery?.fn?.summernote) {
      return window.jQuery(editorRef.current).summernote('code').trim();
    }
    return formContent.trim();
  };

  const handleSubmitWrite = async (e) => {
    e.preventDefault();
    const content = getEditorContent();
    try {
      let fileId = formAttachFile ? await uploadAttachmentFile(formAttachFile) : null;
      await writeInquiry(userId, { title: formTitle.trim(), content, file_id: fileId });
      resetForm();
      loadList();
    } catch (e) { alert('등록 실패'); }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const content = getEditorContent();
    try {
      let fileId = formAttachFile ? await uploadAttachmentFile(formAttachFile) : (detail?.attachment?.fileId ?? null);
      await updateInquiry(userId, selectedId, { title: formTitle.trim(), content, file_id: fileId });
      resetForm();
      setSelectedId(null);
      loadList();
    } catch (e) { alert('수정 실패'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await deleteInquiry(userId, selectedId);
      setSelectedId(null);
      loadList();
    } catch (e) { alert('삭제 실패'); }
  };

  const handleDownload = (attachment) => {
    if (!attachment || !attachment.path) return alert('파일 정보 없음');
    const filepath = `${attachment.path}/${attachment.fileName}.${attachment.ext}`;
    downloadFile(filepath, attachment.originalName).catch(() => alert('다운로드 실패'));
  };


  return (
    <div className="inquiry-page">
      <h2>문의사항</h2>
      <div className="inquiry-toolbar">
        <button className="inquiry-btn primary" onClick={() => { setFormMode('write'); setSelectedId(null); }}>새 문의 작성</button>
      </div>

      <div className="inquiry-grid">
        <div className="inquiry-list">
          <div className="inquiry-list-inner">
            {list.map((item) => (
              <div key={item.inquiry_id} className={`inquiry-card ${selectedId === item.inquiry_id ? 'active' : ''}`} onClick={() => { setSelectedId(item.inquiry_id); setFormMode(null); }}>
                <h4>{item.title || '(제목 없음)'}</h4>
                <div className="inquiry-card-meta">{formatDate(item.created_at)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="inquiry-detail">
          {formMode ? (
            <div className="inquiry-form">
              <h3>{formMode === 'write' ? '새 문의 작성' : '문의 수정'}</h3>
              <form onSubmit={formMode === 'write' ? handleSubmitWrite : handleSubmitEdit}>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="제목" required />
                <div ref={editorRef} className="inquiry-summernote-wrap" />
                <input ref={fileInputRef} type="file" onChange={(e) => setFormAttachFile(e.target.files?.[0] ?? null)} />
                <div className="inquiry-form-actions">
                  <button type="submit" className="inquiry-btn primary">확인</button>
                  <button type="button" className="inquiry-btn secondary" onClick={resetForm}>취소</button>
                </div>
              </form>
            </div>
          ) : detail ? (
            <>
              <h3>{detail.title}</h3>
              <div className="inquiry-detail-meta">작성일: {formatDate(detail.createdAt)}</div>
              <div className="inquiry-detail-content" dangerouslySetInnerHTML={{ __html: detail.content }} />
              
              {detail.attachment && (
                <div className="inquiry-detail-file">
                  <span>첨부파일: </span>
                  <span onClick={() => handleDownload(detail.attachment)} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                    {detail.attachment.originalName}
                  </span>
                </div>
              )}

              <div className="inquiry-detail-actions">
                <button className="inquiry-btn secondary" onClick={() => { setFormMode('edit'); setFormTitle(detail.title); setFormContent(detail.content); }}>수정</button>
                <button className="inquiry-btn danger" onClick={handleDelete}>삭제</button>
              </div>
            </>
          ) : (
            <div className="inquiry-detail-placeholder">문의를 선택해 주세요.</div>
          )}
        </div>
      </div>
    </div>
  );
}