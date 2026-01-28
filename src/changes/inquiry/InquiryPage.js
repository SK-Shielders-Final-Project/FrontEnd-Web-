import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import {
  fetchMyInquiries,
  writeInquiry,
  updateInquiry,
  deleteInquiry,
  downloadFile,
  uploadImageFile,
  uploadImageUrl,
  uploadAttachmentFile,
} from '../api/inquiryApi';
import './InquiryPage.css';

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
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState(null); // null | 'write' | 'edit'
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAttachFile, setFormAttachFile] = useState(/** @type {File|null} */ (null));
  const editorRef = useRef(null);
  const fileInputRef = useRef(/** @type {HTMLInputElement|null} */ (null));

  const loadList = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyInquiries(userId);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || '문의 목록을 불러오지 못했습니다.');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadList();
  }, [userId, loadList]);

  const selected = selectedId ? list.find((i) => Number(i.inquiry_id) === Number(selectedId)) : null;

  const isEditorActive = formMode === 'write' || formMode === 'edit';
  useEffect(() => {
    if (!isEditorActive || !editorRef.current) return;
    let cancelled = false;
    const init = () => {
      if (cancelled || !editorRef.current || !window.jQuery) return;
      const $ = window.jQuery;
      const el = editorRef.current;
      try {
        $(el).summernote({
          placeholder: '문의 내용을 입력하세요',
          height: 200,
          lang: 'ko-KR',
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'picture']],
            ['view', ['fullscreen', 'codeview']],
          ],
          callbacks: {
            onImageUpload: function (files) {
              // 파일 업로드 → /api/image
              const file = files[0];
              if (!file) return;
              uploadImageFile(file)
                .then((url) => {
                  if (cancelled || !url) return;
                  if (window.jQuery && el) window.jQuery(el).summernote('insertImage', url);
                })
                .catch((err) => {
                  setError(err.response?.data?.message || err.message || '이미지 업로드에 실패했습니다.');
                });
            },
            onChange: function (contents) {
              // 이미지 URL이 삽입되었는지 확인하고 /api/image로 전송
              if (cancelled || !el) return;
              const $ = window.jQuery;
              const $editor = $(el);
              const $noteEditor = $editor.next('.note-editor');
              if ($noteEditor.length === 0) return;
              
              // 짧은 딜레이 후 처리 (이미지 삽입 완료 대기)
              setTimeout(() => {
                if (cancelled || !el) return;
                const $imgs = $noteEditor.find('img');
                
                $imgs.each(function () {
                  const $img = $(this);
                  const src = $img.attr('src');
                  if (!src || src.startsWith('data:') || src.startsWith('blob:') || 
                      src.includes('/api/') || $img.data('api-processed')) {
                    return; // 이미 처리되었거나 data/blob URL인 경우 스킵
                  }
                  
                  // /api/image로 전송
                  $img.data('api-processed', true); // 중복 처리 방지
                  uploadImageUrl(src)
                    .then((savedUrl) => {
                      if (cancelled || !savedUrl || savedUrl === src) return;
                      // URL 교체
                      $img.attr('src', savedUrl);
                    })
                    .catch((err) => {
                      console.error('Image URL upload failed:', err);
                      $img.data('api-processed', false); // 실패 시 재시도 가능하도록
                    });
                });
              }, 100);
            },
          },
        });
        if (formMode === 'edit' && formContent) {
          $(el).summernote('code', formContent);
        }
      } catch (err) {
        console.error('Summernote init error', err);
      }
    };
    ensureSummernote().then(init);
    return () => {
      cancelled = true;
      if (editorRef.current && window.jQuery && window.jQuery.fn.summernote) {
        try {
          window.jQuery(editorRef.current).summernote('destroy');
        } catch (_) {}
      }
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
    if (editorRef.current && window.jQuery && window.jQuery.fn.summernote) {
      try {
        const html = window.jQuery(editorRef.current).summernote('code');
        if (html != null) return typeof html === 'string' ? html.trim() : '';
      } catch (_) {}
    }
    return formContent.trim();
  };

  const handleSubmitWrite = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    const content = getEditorContent();
    if (!content) {
      setError('내용을 입력하세요.');
      return;
    }
    try {
      let fileId = null;
      if (formAttachFile) {
        fileId = await uploadAttachmentFile(formAttachFile);
      }
      await writeInquiry(userId, {
        title: formTitle.trim(),
        content,
        file_id: fileId,
      });
      resetForm();
      await loadList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || '등록에 실패했습니다.');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!userId || !selectedId) return;
    setError(null);
    const content = getEditorContent();
    if (!content) {
      setError('내용을 입력하세요.');
      return;
    }
    try {
      let fileId = selected?.file_id ?? null;
      if (formAttachFile) {
        fileId = await uploadAttachmentFile(formAttachFile);
      }
      await updateInquiry(userId, Number(selectedId), {
        title: formTitle.trim(),
        content,
        file_id: fileId,
      });
      resetForm();
      setSelectedId(null);
      await loadList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || '수정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!userId || !selectedId) return;
    if (!window.confirm('이 문의를 삭제하시겠습니까?')) return;
    setError(null);
    try {
      await deleteInquiry(userId, Number(selectedId));
      resetForm();
      setSelectedId(null);
      await loadList();
    } catch (e) {
      setError(e.response?.data?.message || e.message || '삭제에 실패했습니다.');
    }
  };

  const startEdit = () => {
    if (!selected) return;
    setFormMode('edit');
    setFormTitle(selected.title || '');
    setFormContent(selected.content || '');
    setFormAttachFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = (inquiry) => {
    // filename 우선 사용, 없으면 image_url, 마지막으로 file_id
    const filename = inquiry.filename || inquiry.file_name || inquiry.original_filename || 
                     inquiry.image_url || 
                     (inquiry.file_id != null ? String(inquiry.file_id) : '');
    if (!filename) return;
    downloadFile(filename).catch((e) => setError(e.message || '다운로드에 실패했습니다.'));
  };

  if (!isLoggedIn || !userId) {
    return (
      <div className="inquiry-page">
        <h2>문의사항</h2>
        <div className="inquiry-login-required">
          로그인한 회원만 문의 작성 및 조회를 이용할 수 있습니다.
          <br />
          <Link to="/login">로그인</Link> 또는 <Link to="/signup">회원가입</Link> 후 이용해 주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="inquiry-page">
      <h2>문의사항</h2>
      {error && <div className="inquiry-error">{error}</div>}

      <div className="inquiry-toolbar">
        <button
          type="button"
          className="inquiry-btn primary"
          onClick={() => {
            setFormMode('write');
            setSelectedId(null);
            setFormTitle('');
            setFormContent('');
            setFormAttachFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        >
          새 문의 작성
        </button>
      </div>

      <div className="inquiry-grid">
        <div className="inquiry-list">
          <h3 className="inquiry-list-title">내 문의 목록</h3>
          <div className="inquiry-list-inner">
            {loading ? (
              <div className="inquiry-loading">불러오는 중...</div>
            ) : list.length === 0 ? (
              <div className="inquiry-empty">등록된 문의가 없습니다.</div>
            ) : (
              list.map((item) => (
                <div
                  key={item.inquiry_id}
                  className={`inquiry-card ${selectedId === item.inquiry_id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(item.inquiry_id);
                    setFormMode(null);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(item.inquiry_id);
                      setFormMode(null);
                    }
                  }}
                >
                  <h4>{item.title || '(제목 없음)'}</h4>
                  <div className="inquiry-card-meta">{formatDate(item.created_at)}</div>
                  {item.admin_reply && (
                    <div className="inquiry-card-replied">답변 완료</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="inquiry-detail">
          {formMode === 'write' && (
            <div className="inquiry-form">
              <h3>새 문의 작성</h3>
              <form onSubmit={handleSubmitWrite}>
                <label htmlFor="inquiry-title">제목</label>
                <input
                  id="inquiry-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                />
                <label htmlFor="inquiry-content" style={{ marginTop: 12 }}>내용</label>
                <div
                  id="inquiry-content"
                  ref={editorRef}
                  className="inquiry-summernote-wrap"
                  aria-label="문의 내용"
                />
                <label htmlFor="inquiry-file" style={{ marginTop: 12 }}>첨부 파일 (로컬 파일)</label>
                <input
                  id="inquiry-file"
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFormAttachFile(e.target.files?.[0] ?? null)}
                  style={{ display: 'block', marginTop: 6 }}
                  accept="*/*"
                />
                {formAttachFile && (
                  <span className="inquiry-attach-filename" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                    선택: {formAttachFile.name}
                  </span>
                )}
                <div className="inquiry-form-actions">
                  <button type="submit" className="inquiry-btn primary">등록</button>
                  <button
                    type="button"
                    className="inquiry-btn secondary"
                    onClick={resetForm}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {formMode === 'edit' && (
            <div className="inquiry-form">
              <h3>문의 수정</h3>
              <form onSubmit={handleSubmitEdit}>
                <label htmlFor="edit-title">제목</label>
                <input
                  id="edit-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <label htmlFor="edit-content" style={{ marginTop: 12 }}>내용</label>
                <div
                  id="edit-content"
                  ref={editorRef}
                  className="inquiry-summernote-wrap"
                  aria-label="문의 내용"
                />
                <label htmlFor="edit-file" style={{ marginTop: 12 }}>첨부 파일 (로컬 파일)</label>
                <input
                  id="edit-file"
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setFormAttachFile(e.target.files?.[0] ?? null)}
                  style={{ display: 'block', marginTop: 6 }}
                  accept="*/*"
                />
                {formAttachFile && (
                  <span className="inquiry-attach-filename" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                    선택: {formAttachFile.name}
                  </span>
                )}
                <div className="inquiry-form-actions">
                  <button type="submit" className="inquiry-btn primary">수정 완료</button>
                  <button
                    type="button"
                    className="inquiry-btn secondary"
                    onClick={() => {
                      resetForm();
                      setSelectedId(selected?.inquiry_id ?? null);
                    }}
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}

          {!formMode && !selected && (
            <div className="inquiry-detail-placeholder">
              왼쪽 목록에서 문의를 선택하거나, 새 문의를 작성해 주세요.
            </div>
          )}

          {!formMode && selected && (
            <>
              <h3>{selected.title || '(제목 없음)'}</h3>
              <div className="inquiry-detail-meta">
                작성일: {formatDate(selected.created_at)}
                {selected.updated_at && ` · 수정일: ${formatDate(selected.updated_at)}`}
              </div>
              {selected.content && /<[a-z][\s\S]*>/i.test(selected.content) ? (
                <div
                  className="inquiry-detail-content inquiry-detail-content-html"
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              ) : (
                <div className="inquiry-detail-content">{selected.content || '-'}</div>
              )}
              {(selected.image_url || (selected.file_id != null && selected.file_id !== '')) && (
                <div className="inquiry-detail-file">
                  <button
                    type="button"
                    onClick={() => handleDownload(selected)}
                  >
                    첨부파일 다운로드
                  </button>
                </div>
              )}
              {selected.admin_reply && (
                <div className="inquiry-detail-reply">
                  <h4>관리자 답변</h4>
                  <p>{selected.admin_reply}</p>
                </div>
              )}
              <div className="inquiry-detail-actions">
                <button type="button" className="inquiry-btn secondary" onClick={startEdit}>
                  수정
                </button>
                <button type="button" className="inquiry-btn danger" onClick={handleDelete}>
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
