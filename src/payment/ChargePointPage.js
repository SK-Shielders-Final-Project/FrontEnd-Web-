import React, { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import './ChargePointPage.css';
import config from '../config/config.json';

const ChargePointPage = () => {
  const [amount, setAmount] = useState(''); // 입력한 포인트 양

  // 1. 토스 페이먼츠 클라이언트 키 (테스트용)
  const clientKey = config.toss_client_key;
  const handlePayment = async () => {
    if (!amount || amount < 100) {
      alert("최소 100원 이상 결제해야 합니다.");
      return;
    }

    try {
      const tossPayments = await loadTossPayments(clientKey);
      
      // 2. 결제창 띄우기 (requestPayment)
      await tossPayments.requestPayment('카드', {
        amount: Number(amount), // 결제 금액
        orderId: `ORDER_${new Date().getTime()}`, // 주문 ID (유니크해야 함)
        orderName: `${amount} 포인트 충전`, // 주문명
        customerName: '홍길동', // (선택) 구매자 이름
        successUrl: window.location.origin + '/payment/success', // 성공 시 이동할 주소
        failUrl: window.location.origin + '/payment/fail',       // 실패 시 이동할 주소
      });
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 창 호출 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">포인트 충전하기</h2>

      <div className="input-group">
        <label>충전할 금액</label>
        <input 
          type="number" 
          placeholder="금액을 입력하세요" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* 실시간 계산 결과 보여주기 */}
      <div className="summary-card">
        <div className="summary-row">
          <span>충전 포인트</span>
          <span>{amount ? Number(amount).toLocaleString() : 0} P</span>
        </div>
        <div className="summary-row total">
          <span>최종 결제 금액</span>
          <span className="price">
            {amount ? Number(amount).toLocaleString() : 0} 원
          </span>
        </div>
      </div>

      <button className="pay-button" onClick={handlePayment}>
        토스 페이먼츠로 결제하기
      </button>
    </div>
  );
};

export default ChargePointPage;