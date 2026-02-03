import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { getTemplate, updateTemplate, getPreview } from '../api/emailTemplateApi';
import './EmailTemplatePage.css';

const EmailTemplatePage = () => {
    const [templateName, setTemplateName] = useState('password-reset');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            setLoading(true);
            try {
                const data = await getTemplate(templateName);
                setSubject(data.subject);
                setContent(data.content);
                setError(null);
            } catch (err) {
                setError('템플릿을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [templateName]);

    const handlePreview = async () => {
        setLoading(true);
        try {
            const data = await getPreview(content);
            setPreview(data.renderedContent);
            setError(null);
        } catch (err) {
            setError('미리보기를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTemplate(templateName, { subject, content });
            alert('저장되었습니다.');
            setError(null);
        } catch (err) {
            setError('템플릿을 저장하는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="email-template-container">
            <div className="email-template-content-wrapper">
                <h2>이메일 템플릿 관리</h2>
                <div className="template-selector">
                    <label htmlFor="template-select">템플릿 선택:</label>
                    <select id="template-select" value={templateName} onChange={(e) => setTemplateName(e.target.value)}>
                        <option value="password-reset">비밀번호 재설정</option>
                    </select>
                </div>

                {loading && <p>로딩 중...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="template-editor">
                    <div className="editor-section" s>
                        <h2>템플릿 편집</h2>
                        <div className="form-group">
                            <label htmlFor="subject">이메일 제목:</label>
                            <input
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>이메일 본문 (HTML):</label>
                            <CodeMirror
                                value={content}
                                extensions={[html()]}
                                onChange={(value) => setContent(value)}
                            />
                        </div>
                        <div className="button-group">
                            <button onClick={handleSave} disabled={loading}>저장</button>
                            <button onClick={handlePreview} disabled={loading}>미리보기</button>
                        </div>
                    </div>

                    <div className="preview-section">
                        <h2>미리보기</h2>
                        <div
                            className="preview-content"
                            dangerouslySetInnerHTML={{ __html: preview }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailTemplatePage;