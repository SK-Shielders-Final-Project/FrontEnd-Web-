import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // useSearchParams import 필수
import './HistoryPage.css';
import api from '../api/axiosConfig';

const HistoryPage = () => {
  const navigate = useNavigate(); 
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('payment');
  const [paymentList, setPaymentList] = useState([]);
  const [usageList, setUsageList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inputStartDate, setInputStartDate] = useState(searchParams.get('startDate') || '');
  const [inputEndDate, setInputEndDate] = useState(searchParams.get('endDate') || '');
  const [inputBikeId, setInputBikeId] = useState(searchParams.get('bikeId') || '');

  // 탭 변경 시 URL 파라미터 초기화
  useEffect(() => {
    if (activeTab === 'payment') {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  // 데이터 조회
  const fetchData = async () => {
    setLoading(true);
    setPaymentList([]);
    setUsageList([]);
    
    try {
      if (activeTab === 'payment') {
        const response = await api.get('/api/payments/user');
        setPaymentList(response.data);
      } else {
        // URL에서 검색 조건 가져오기
        const queryStart = searchParams.get('startDate');
        const queryEnd = searchParams.get('endDate');
        const queryBikeId = searchParams.get('bikeId');

        // 검색 조건이 있으면 검색 API 호출, 없으면 전체 조회
        if (queryStart && queryEnd) {
          console.log(`[API 호출] /rentals/search?startDate=${queryStart}&endDate=${queryEnd}&bikeId=${queryBikeId}`);
          
          const response = await api.get('/api/user/point/search', {
            params: {
              startDate: queryStart,
              endDate: queryEnd,
              bikeId: queryBikeId || null
            }
          });
          setUsageList(response.data);
        } else {
          // 검색 조건이 없으면 기존 전체 조회
          const response = await api.get('/api/user/point'); 
          setUsageList(response.data);
        }
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // URL이 바뀌거나 탭이 바뀌면 데이터 다시 조회
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchParams]);

  // 검색 버튼 핸들러 (URL 변경)
  const handleSearch = () => {
    if (!inputStartDate || !inputEndDate) {
      alert("시작 날짜와 종료 날짜를 모두 선택해주세요.");
      return;
    }

    // URL을 변경함 -> useEffect가 감지해서 fetchData 실행
    setSearchParams({
      startDate: inputStartDate,
      endDate: inputEndDate,
      bikeId: inputBikeId
    });
  };

  // [Action] 아이템 클릭 -> /refund 페이지로 이동
  const handleItemClick = (item) => {
    if (item.status === 'CANCELED') return;

    let confirmMsg = "해당 결제 건에 대해 환불을 진행하시겠습니까?";
    if (item.status === 'PARTIAL_CANCELED') {
      confirmMsg = "부분 취소된 건입니다. 남은 금액에 대해 추가 환불하시겠습니까?";
    }

    if (window.confirm(confirmMsg)) {
      navigate('/refund', { state: { targetItem: item } });
    }
  };

  // Helper 함수들
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const diffMs = new Date(end) - new Date(start);
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour}시간`;
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'READY': return <span className="status ready">결제대기</span>;
      case 'DONE': return <span className="status done">결제완료</span>;
      case 'PARTIAL_CANCELED': return <span className="status partial">부분취소</span>;
      case 'CANCELED': return <span className="status canceled">취소완료</span>;
      default: return <span className="status done">{status || '결제완료'}</span>;
    }
  };

  return (
    <div className="history-container">
      <div className="tab-header">
        <button className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
          결제 내역 조회
        </button>
        <button className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`} onClick={() => setActiveTab('usage')}>
          이용 내역 조회
        </button>
      </div>

    {activeTab === 'usage' && (
        <div className="search-bar-container">
          <input 
            type="date" 
            value={inputStartDate}
            onChange={(e) => setInputStartDate(e.target.value)}
            className="search-input"
          />
          <span className="tilde">~</span>
          <input 
            type="date" 
            value={inputEndDate}
            onChange={(e) => setInputEndDate(e.target.value)}
            className="search-input"
          />
          <input 
            type="text" 
            placeholder="자전거 ID (선택)"
            value={inputBikeId}
            onChange={(e) => setInputBikeId(e.target.value)}
            className="search-input text-input"
          />
          <button onClick={handleSearch} className="search-btn">검색</button>
        </div>
      )}

      <div className="history-list">
        {loading ? (
          <p className="empty-msg">불러오는 중...</p>
        ) : (
          <>
            {activeTab === 'payment' && (
              <>
                {paymentList.length === 0 ? (
                  <p className="empty-msg">결제 내역이 없습니다.</p>
                ) : (
                  paymentList.map((item, index) => {
                    const isFullyCanceled = item.status === 'CANCELED';
                    return (
                      <div 
                        key={index} 
                        className={`history-card ${isFullyCanceled ? 'disabled' : 'clickable'}`}
                        onClick={() => !isFullyCanceled && handleItemClick(item)}
                        title={isFullyCanceled ? "이미 취소된 내역입니다" : "클릭하여 환불 요청"}
                      >
                        <div className="card-left">
                          <h4>{item.paymentMethod}</h4>
                          <p>{item.createAt ? formatDate(item.createAt) : '날짜 정보 없음'}</p>
                        </div>
                        <div className="card-right">
                          <div className="amount">-{item.amount.toLocaleString()} 원</div>
                          {renderStatusBadge(item.status)}
                          {!isFullyCanceled && (
                            <div style={{fontSize:'11px', color:'#999', marginTop:'4px'}}>클릭하여 환불</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}
            
            {/* ... 이용 내역 부분 ... */}
             {activeTab === 'usage' && (
              <>
                {usageList.length === 0 ? (
                  <p className="empty-msg">이용 내역이 없습니다.</p>
                ) : (
                  usageList.map((item, index) => (
                    <div key={index} className="history-card">
                      <div className="card-left">
                        <h4>🚲 Bike No. {item.bikeId}</h4>
                        <p style={{ marginTop: '5px', lineHeight: '1.4' }}>
                           {formatDate(item.startTime)} ~ <br/>
                           {formatDate(item.endTime)}
                        </p>
                      </div>
                      <div className="card-right" style={{ alignSelf: 'center' }}>
                        <div className="amount" style={{ color: '#007bff', fontSize: '1.1rem' }}>
                            {calculateDuration(item.startTime, item.endTime)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'right' }}>
                            이용함
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