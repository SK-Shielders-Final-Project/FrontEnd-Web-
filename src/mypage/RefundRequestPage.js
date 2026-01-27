import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RefundRequestPage.css';

const RefundRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const targetItem = location.state?.targetItem;

  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  // 잘못된 접근 처리
  useEffect(() => {
    if (!targetItem) {
      alert("잘못된 접근입니다. 내역 페이지에서 선택해주세요.");
      navigate('/history');
    }
  }, [targetItem, navigate]);

  if (!targetItem) return null;

  // 상태값 한글 변환
  const getStatusText = (status) => {
    switch (status) {
      case 'READY': return '결제대기';
      case 'DONE': return '결제완료';
      case 'PARTIAL_CANCELED': return '부분취소';
      case 'CANCELED': return '취소완료';
      default: return status;
    }
  };

  const handleFullAmount = () => {
    // remainAmount가 없으면(undefined/null) 초기 결제 금액(amount)을 대신 사용 (안전장치)
    const maxRefundable = targetItem.remainAmount ?? targetItem.amount;
    setRefundAmount(maxRefundable);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("환불 사유를 입력해주세요.");
      return;
    }

    const amountNum = Number(refundAmount);
    
    // 환불 가능 금액 (없으면 원금)
    const maxRefundable = targetItem.remainAmount ?? targetItem.amount;

    if (!refundAmount || amountNum <= 0) {
      alert("환불할 금액을 올바르게 입력해주세요.");
      return;
    }

    if (amountNum > maxRefundable) {
      alert(`환불 가능 금액(${maxRefundable.toLocaleString()}원)을 초과할 수 없습니다.`);
      return;
    }

    try {
      const response = await axios.post('/api/payments/admin/cancel', {
        paymentKey: targetItem.paymentKey,
        cancelReason: reason,
        cancelAmount: amountNum
      });
      
      const canceledAmt = response.data.canceledAmount || amountNum;
      alert(`환불 요청이 완료되었습니다.\n(환불된 금액: ${canceledAmt.toLocaleString()}원)`);
      navigate('/history');

    } catch (error) {
      console.error("환불 에러:", error);
      const msg = error.response?.data?.message || "환불 처리 중 오류가 발생했습니다.";
      alert(msg);
    }
  };

  return (
    <div className="history-container">
      <h2 className="page-title">환불 요청</h2>
      
      <div className="refund-container">
        <p className="refund-guide-text">
          환불 사유와 금액을 입력해주세요.<br/>
          (부분 환불도 가능합니다)
        </p>

        {/* 결제 정보 요약 */}
        <div className="refund-info-box">
          <div className="refund-row">
            <span>결제 수단</span>
            <strong>{targetItem.paymentMethod}</strong>
          </div>
          <div className="refund-row">
            <span>결제 원금</span>
            <span>{targetItem.amount.toLocaleString()} 원</span>
          </div>
          
          <div className="refund-row">
            <span>환불 가능 금액</span>
            <strong className="text-highlight">
              {(targetItem.remainAmount ?? targetItem.amount).toLocaleString()} 원
            </strong>
          </div>

          <div className="refund-row">
            <span>현재 상태</span>
            <span>{getStatusText(targetItem.status)}</span>
          </div>
        </div>

        {/* 환불 금액 입력 */}
        <label className="refund-label">환불 신청 금액</label>
        <div className="refund-amount-wrapper">
          <input
            type="number"
            className="refund-input-amount"
            placeholder="금액 입력"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
          />
          <button className="btn-full-amount" onClick={handleFullAmount}>
            전액
          </button>
        </div>

        {/* 환불 사유 입력 */}
        <label className="refund-label">환불 사유 (필수)</label>
        <textarea
          className="refund-textarea"
          placeholder="예: 서비스 불만족, 단순 변심 등"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        {/* 버튼 그룹 */}
        <div className="btn-group">
          <button className="btn-cancel" onClick={() => navigate(-1)}>
            취소
          </button>
          <button className="btn-refund-action" onClick={handleSubmit}>
            환불 요청하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundRequestPage;