import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { getUsernameFromToken } from '../utils/jwtUtils'; // 유틸 import
import './PointGiftHistoryPage.css';

const PointGiftHistoryPage = () => {
    const [historyList, setHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 내 아이디를 알아야 "보냄/받음"을 구분할 수 있음
    const myId = getUsernameFromToken(); 

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // 백엔드: /api/point/gift/history
                const response = await api.get('/api/user/point/gift/history');
                setHistoryList(response.data);
            } catch (err) {
                console.error("내역 조회 실패", err);
                setError("내역을 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // 날짜 포맷팅 함수 (예: 2026.02.02 14:30)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="loading-msg">내역 로딩 중...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="history-container">
            <h2 className="history-title">🎁 포인트 선물 내역</h2>
            
            {historyList.length === 0 ? (
                <p className="no-data">주고받은 선물 내역이 없습니다.</p>
            ) : (
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>날짜</th>
                            <th>구분</th>
                            <th>상대방</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyList.map((item, index) => {
                            // 내가 보낸 사람(sender)이면 -> '보냄' (출금)
                            // 내가 받은 사람(receiver)이면 -> '받음' (입금)
                            const isSent = item.senderName === myId;

                            return (
                                <tr key={index}>
                                    <td className="col-date">{formatDate(item.createdAt)}</td>
                                    <td className={`col-type ${isSent ? 'sent' : 'received'}`}>
                                        {isSent ? '보냄' : '받음'}
                                    </td>
                                    <td className="col-target">
                                        {isSent ? item.receiverName : item.senderName}
                                    </td>
                                    <td className={`col-amount ${isSent ? 'minus' : 'plus'}`}>
                                        {isSent ? '-' : '+'} {item.amount.toLocaleString()} P
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PointGiftHistoryPage;