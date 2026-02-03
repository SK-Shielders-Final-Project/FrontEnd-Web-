import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OtpVerificationPage.css';
import { setCookie, getCookie } from '../../utils/cookie';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp) {
            alert("OTP를 입력해주세요.");
            return;
        }

        try {
            // 서버로 OTP 번호 전송
            const response = await axios.post('/api/admin/2fa/verify', { code: otp });

            // [수정 포인트] 백엔드 응답 헤더의 'success' 값을 확인합니다.
            // 공격자가 Burp Suite로 response.data를 true로, 헤더를 success로 조작하면 이 조건문을 통과합니다.
            if (response.data === true && response.headers['x-2fa-status'] === 'success') {
                alert("인증 성공! 대시보드로 이동합니다.");

                const tempAdminToken = sessionStorage.getItem('tempAdminToken');
                
                if (tempAdminToken) {
                    // 세션에 임시 보관 중이던 토큰을 로컬스토리지로 옮겨 정식 로그인을 완료합니다.
                    setCookie('adminToken', tempAdminToken, 1);
                    setCookie('adminId', sessionStorage.getItem('tempAdminId'), 1);
                    setCookie('adminRefreshToken', sessionStorage.getItem('tempAdminRefreshToken'), 7);

                    // AdminApp에 변경 사실을 알리기 위한 이벤트 발생
                    window.dispatchEvent(new Event('localStorageUpdated'));

                    // 사용이 끝난 임시 토큰은 삭제합니다.
                    sessionStorage.removeItem('tempAdminToken');
                    sessionStorage.removeItem('tempAdminId');
                    sessionStorage.removeItem('tempAdminRefreshToken');

                    // navigate('/admin/dashboard');
                    window.location.reload();

                } else {
                    alert("오류: 관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
                    navigate('/admin');
                }
            } else {
                 // 서버가 200 OK를 줬더라도 헤더값이 success가 아니면 실패 처리
                 alert("인증 실패: 유효하지 않은 인증 상태입니다.");
            }
        } catch (error) {
            // [해킹 시나리오] 틀린 번호 입력 시 서버는 401 에러를 던지고 이 catch 문으로 들어옵니다.
            // 공격자는 이 시점에서 401 응답을 가로채 200 OK와 success 헤더로 변조하여 try 구문으로 돌려보냅니다.
            console.error("Verification Error:", error);
            alert("인증 실패! 번호를 다시 확인하거나 시스템 관리자에게 문의하세요.");
        }
    };

    return (
        <div className="otp-verification-container">
            <div className="otp-form-card">
                <h2>2-Factor Authentication</h2>
                <p>Google Authenticator 앱의 6자리 코드를 입력하세요.</p>
                <form onSubmit={handleOtpSubmit} className="otp-form">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-Digit Code"
                        maxLength="6"
                        className="otp-input"
                    />
                    <button type="submit" className="otp-verify-btn">인증하기</button>
                </form>
            </div>
        </div>
    );
};

export default OtpVerificationPage;