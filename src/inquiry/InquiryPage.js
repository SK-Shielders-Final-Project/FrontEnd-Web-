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
  uploadImageUrl,
  uploadAttachmentFile,
} from '../api/inquiryApi';
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

  // 문의 목록 로드
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

  // 문의 상세 로드
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

  // Summernote 설정 (생략된 로직 동일)
  const isEditorActive = formMode === 'write' || formMode === 'edit';
  useEffect(() => {
    if (!isEditorActive || !editorRef.current) return;
    let cancelled = false;
    ensureSummernote().then(() => {
      if (cancelled || !editorRef.current || !window.jQuery) return;
      const $ = window.jQuery;
      $(editorRef.current).summernote({
        placeholder: '내용을 입력하세요',
        height: 200,
        lang: 'ko-KR',
        callbacks: {
          onImageUpload: (files) => {
            uploadImageFile(files[0]).then(url => $(editorRef.current).summernote('insertImage', url));
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

  const resetForm = () => {
    setFormMode(null);
    setFormTitle('');
    setFormContent('');
    setFormAttachFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getEditorContent = () => {
    if (editorRef.current && window.jQuery?.fn?.summernote) {
      return window.jQuery(editorRef.current).summernote('code').trim();
    }
    return formContent.trim();
  };

  // 등록/수정/삭제 핸들러
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

  // --- 핵심 수정 구간: 파일 핸들러 ---
  
  const handleDownload = (attachment) => {
    if (!attachment || !attachment.path) return alert('파일 정보 없음');
    
    // 백엔드 파라미터 요구사항: file={path}/{fileName}.{ext}
    const filepath = `${attachment.path}/${attachment.fileName}.${attachment.ext}`;
    
    // downloadFile(filepath, originalName)
    downloadFile(filepath, attachment.originalName)
      .catch((e) => alert('다운로드 실패'));
  };

  const handlePreview = (attachment) => {
    if (!attachment || !attachment.path) return alert('파일 정보 없음');
    
    const filepath = `${attachment.path}/${attachment.fileName}.${attachment.ext}`;
    
    // viewFile(filepath) 호출 -> 백엔드에서 이미지면 출력, 아니면 exec() 실행
    viewFile(filepath)
      .catch((e) => alert('미리보기 실패'));
  };

  // --- 렌더링 구간 ---
  return (
    <div className="inquiry-page">
      <h2>문의사항</h2>
      <div className="inquiry-toolbar">
        <button className="inquiry-btn primary" onClick={() => { setFormMode('write'); setSelectedId(null); }}>새 문의 작성</button>
      </div>

      <div className="inquiry-grid">
        {/* 목록 섹션 */}
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

        {/* 상세/폼 섹션 */}
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
                  <span onClick={() => handlePreview(detail.attachment)} style={{ cursor: 'pointer', marginLeft: '12px' }}>🔍 미리보기</span>
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