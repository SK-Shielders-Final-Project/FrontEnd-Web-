import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // LoginPage에서 전달받은 2FA 등록 여부 (최초면 false, 아니면 true)
    const is2faEnabled = location.state?.is2faEnabled;

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const userId = sessionStorage.getItem('tempAdminId');

        if (!otp || otp.length < 6) {
            alert("6자리 인증번호를 입력해주세요.");
            return;
        }

        // 최초 등록이면 verify-initial, 이미 등록됐으면 verify 호출
        const url = is2faEnabled ? '/api/admin/2fa/verify' : '/api/admin/2fa/verify-initial';

        try {
            const response = await axios.post(url, { code: otp, userId: userId });

            // 백엔드 응답 헤더 또는 데이터 성공 여부 확인
            if (response.headers['x-2fa-status'] === 'success' || response.data.success === true) {
                alert("인증에 성공하였습니다.");
                
<<<<<<< Updated upstream
                // LocalStorage에서 임시 값 가져오기
                const tempAccessToken = localStorage.getItem("token");
                const tempRefreshToken = localStorage.getItem("refreshToken");
                const tempAdminId = localStorage.getItem("adminId");

                // 가져온 값을 setCookie 함수를 사용하여 쿠키에 저장
                if (tempAccessToken) {
                    setCookie('adminToken', tempAccessToken, 1); // 1일 유효
                }
                if (tempRefreshToken) {
                    setCookie('adminRefreshToken', tempRefreshToken, 7); // 7일 유효
                }
                if (tempAdminId) {
                    setCookie('adminId', tempAdminId, 1); // 1일 유효
                }
                
                // LocalStorage의 임시 값들 삭제
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("adminId");
=======
                // 최종 인증 토큰 localStorage 저장
                localStorage.setItem('adminToken', response.data.accessToken);
                localStorage.setItem('adminId', response.data.userId);
>>>>>>> Stashed changes
                
                // 임시 세션 데이터 정리
                sessionStorage.removeItem('tempAdminId');
                
                // 대시보드로 리다이렉트
                window.location.href = '/admin/dashboard';
            } else {
                alert("인증 코드가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error("OTP Verification Error:", error);
            alert("인증 실패! 코드를 다시 확인하거나 관리자에게 문의하세요.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>2단계 OTP 인증</h2>
                <p style={styles.instruction}>
                    Google Authenticator 앱에 표시된<br />
                    6자리 인증 코드를 입력하세요.
                </p>
                <form onSubmit={handleOtpSubmit} style={styles.form}>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        maxLength="6"
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>인증 및 로그인</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' },
    card: { padding: '40px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px' },
    title: { marginBottom: '10px', fontSize: '24px', color: '#333' },
    instruction: { marginBottom: '30px', color: '#666', lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    input: { padding: '15px', fontSize: '24px', textAlign: 'center', letterSpacing: '5px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' },
    button: { padding: '15px', fontSize: '16px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default OtpVerificationPage;