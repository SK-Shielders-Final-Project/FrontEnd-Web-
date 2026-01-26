import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SuccessPage.css'; 

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [isConfirmed, setIsConfirmed] = useState(false); 
  const [responseData, setResponseData] = useState(null); 

  const isRun = useRef(false); 

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true; 

    const confirmPayment = async () => {
      try {
        const response = await fetch('/api/payments/user/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey: paymentKey,
            orderId: orderId,
            amount: Number(amount),
          }),
        });

        if (!response.ok) {
          throw new Error('결제 승인 처리에 실패했습니다.');
        }

        const data = await response.json();
        
        // ★ [변경 2] 백엔드 응답(JSON)을 통째로 State에 저장
        // (data 안에는 paymentId, userId, totalPoint 등이 들어있음)
        setResponseData(data); 

        setIsConfirmed(true); 
        console.log("백엔드 응답:", data);

      } catch (error) {
        console.error("결제 확인 중 오류:", error);
        navigate(`/payment/fail?message=${error.message}`);
      }
    };

    if (paymentKey && orderId && amount) {
      confirmPayment();
    }
  }, [paymentKey, orderId, amount, navigate]);

  return (
    <div className="success-wrapper" style={{ textAlign: 'center', padding: '50px' }}>
      {isConfirmed ? (
        <div className="success-container">
          <h1 style={{ color: 'blue' }}>결제가 완료되었습니다! 🎉</h1>
          
          <div className="receipt-box" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', display: 'inline-block', textAlign: 'left', minWidth: '300px' }}>
            
            {/* ★ [변경 3] 주문번호 대신 totalPoint 보여주기 */}
            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>현재 보유 포인트:</strong> 
              {/* responseData가 있을 때만 totalPoint를 보여줌 */}
              <span style={{ color: 'blue', fontWeight: 'bold' }}>
                {responseData ? responseData.totalPoint.toLocaleString() : 0} P
              </span>
            </p>

            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>결제 금액:</strong> 
              <span>{Number(amount).toLocaleString()} 원</span>
            </p>

          </div>
          
          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => navigate('/')}
              style={{ padding: '10px 20px', backgroundColor: 'skyblue', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      ) : (
        <div className="loading-container">
          <h1>결제 승인 중입니다...</h1>
          <p>잠시만 기다려주세요.</p>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid skyblue', borderRadius: '50%', margin: '20px auto', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;