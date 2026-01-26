import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoryPage.css';

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' | 'usage'
  const [paymentList, setPaymentList] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 데이터 조회 (더미 데이터 삭제됨)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 데이터 초기화 (탭 전환 시 이전 데이터 잔상 방지)
      setPaymentList([]);
      setUsageList([]);

      try {
        if (activeTab === 'payment') {
          // [API] 결제 내역 조회
          const response = await axios.get('/api/payments/user');
          setPaymentList(response.data);
        } else {
          // [API] 이용 내역 조회
          const response = await axios.get('/api/user/point');
          setUsageList(response.data);
        }
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        alert("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // 날짜 포맷팅 (YYYY.MM.DD HH:mm)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 이용 시간(Duration) 계산
  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    const diffMs = endTime - startTime;
    const diffMin = Math.floor(diffMs / (1000 * 60)); // 분 단위
    const diffHour = Math.floor(diffMin / 60); // 시간 단위

    if (diffHour > 0) {
        const remainMin = diffMin % 60;
        return `${diffHour}시간 ${remainMin > 0 ? remainMin + '분' : ''}`;
    } else {
        return `${diffMin}분`;
    }
  };

  return (
    <div className="history-container">
      {/* 상단 탭 버튼 */}
      <div className="tab-header">
        <button 
          className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          결제 내역 조회
        </button>
        <button 
          className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveTab('usage')}
        >
          이용 내역 조회
        </button>
      </div>

      {/* 리스트 영역 */}
      <div className="history-list">
        {loading ? (
          <p className="empty-msg">불러오는 중...</p>
        ) : (
          <>
            {/* --- [A] 결제 내역 탭 --- */}
            {activeTab === 'payment' && (
              <>
                {paymentList.length === 0 ? (
                  <p className="empty-msg">결제 내역이 없습니다.</p>
                ) : (
                  paymentList.map((item, index) => (
                    <div key={index} className="history-card">
                      <div className="card-left">
                        {/* 결제 수단 */}
                        <h4>{item.paymentMethod}</h4>
                        {/* 결제 일시 (createAt) */}
                        <p>{item.createAt ? formatDate(item.createAt) : '날짜 정보 없음'}</p>
                      </div>
                      <div className="card-right">
                        {/* 결제 금액 */}
                        <div className="amount">-{item.amount.toLocaleString()} 원</div>
                        {/* 결제 상태 배지 (결제 내역엔 유지) */}
                        <span className="status paid">결제완료</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* --- [B] 이용 내역 탭 --- */}
            {activeTab === 'usage' && (
              <>
                {usageList.length === 0 ? (
                  <p className="empty-msg">이용 내역이 없습니다.</p>
                ) : (
                  usageList.map((item, index) => (
                    <div key={index} className="history-card">
                      <div className="card-left">
                        {/* 자전거 번호 */}
                        <h4>🚲 Bike No. {item.bikeId}</h4>
                        {/* 이용 기간 */}
                        <p style={{ marginTop: '5px', lineHeight: '1.4' }}>
                           {formatDate(item.startTime)} ~ <br/>
                           {formatDate(item.endTime)}
                        </p>
                      </div>
                      <div className="card-right" style={{ alignSelf: 'center' }}>
                        <div className="amount" style={{ color: '#007bff', fontSize: '1.1rem' }}>
                            {calculateDuration(item.startTime, item.endTime)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;