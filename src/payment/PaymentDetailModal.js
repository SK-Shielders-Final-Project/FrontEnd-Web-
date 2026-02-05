import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import './PaymentDetailModal.css';

const PaymentDetailModal = ({ isOpen, onClose, paymentId, onRefund }) => {
  const [memoInput, setMemoInput] = useState('');
  const [receiptHtml, setReceiptHtml] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMemoInput('');
      setReceiptHtml(null);
    }
  }, [isOpen, paymentId]);

  if (!isOpen) return null;

  const handleInsertDateMacro = () => {
    setMemoInput((prev) => prev + '[발급일]');
  };

      const handlePreview = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage
  
        // 일반 텍스트 오류 방지 및 매크로 코드 변환 로직
        let transformedMemo = memoInput.replace(/\[발급일\]/g, `' + #dates.format(#dates.createNow(), 'yyyy-MM-dd') + '`);
        transformedMemo = `'` + transformedMemo + `'`;
          const response = await axios.post(
            '/api/payment/receipt/preview',
            {
                paymentId: paymentId,
                userMemo: transformedMemo,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );      
          setReceiptHtml(response.data);
    } catch (error) {
      console.error('Error fetching receipt preview:', error);
      alert('영수증 미리보기를 불러오는 데 실패했습니다.');
      setReceiptHtml(null); // Clear previous HTML on error
    }
  };

  const handleDownload = () => {
    alert('PDF 다운로드 기능은 준비 중입니다.');
  };

  const handleRefundClick = () => {
    onRefund(paymentId);
  };

  return (
    <div className="payment-detail-modal-overlay">
      <div className="payment-detail-modal-content">
        <div className="payment-detail-modal-header">
          <h2>결제 상세 및 영수증 관리</h2>
          <button className="payment-detail-modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="payment-detail-modal-body">
          <div className="memo-section">
            <div className="macro-toolbar">
              <button onClick={handleInsertDateMacro}>📅 발급일 자동 입력</button>
            </div>
            <textarea
              className="memo-input"
              value={memoInput}
              onChange={(e) => setMemoInput(e.target.value)}
              placeholder="메모를 입력하세요. 예: 발급일, 이용 목적"
            ></textarea>
          </div>

          <div className="button-group">
            <button className="btn btn-primary" onClick={handlePreview}>
              영수증 미리보기
            </button>
            <button className="btn btn-secondary" onClick={handleDownload}>
              영수증 다운로드
            </button>
            <button className="btn btn-danger" onClick={handleRefundClick}>
              결제 취소(환불)
            </button>
          </div>

          <div className="payment-detail-preview-area">
            <h3>영수증 미리보기</h3>
            {receiptHtml ? (
              <div
                className="receipt-display"
                dangerouslySetInnerHTML={{ __html: receiptHtml }}
              />
            ) : (
              <p className="receipt-placeholder">메모를 입력하고 미리보기를 누르세요.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
