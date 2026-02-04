import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './OtpVerificationPage.css';
import { setCookie } from '../../utils/cookie';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [is2faEnabled, setIs2faEnabled] = useState(null); // null로 초기화하여 로딩 상태 구분
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // LoginPage에서 넘겨준 is2faEnabled 상태 확인
        const enabledStatus = location.state?.is2faEnabled;
        setIs2faEnabled(enabledStatus);

        // 만약 false(최초 설정)라면 백엔드에 QR 생성 요청
        if (enabledStatus === false) {
            const generateQrCode = async () => {
                try {
                    // 백엔드에서 QR코드용 데이터 URI를 생성해주는 API
                    const response = await axios.post('/api/admin/2fa/generate-secret');
                    setQrCode(response.data.qrCodeDataUri);
                } catch (error) {
                    console.error("QR Code generation error:", error);
                    alert("QR 코드를 불러올 수 없습니다. 다시 로그인해 주세요.");
                    navigate('/admin');
                }
            };
            generateQrCode();
        }
    }, [location.state, navigate]);

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp) {
            alert("OTP 번호 6자리를 입력해주세요.");
            return;
        }

        // 등록 여부에 따른 검증 엔드포인트 분기
        const verificationUrl = is2faEnabled ? '/api/admin/2fa/verify' : '/api/admin/2fa/verify-initial';

        try {
            const response = await axios.post(verificationUrl, { code: otp });

            if (response.data.success === true) {
                alert("인증에 성공하였습니다.");

                // 쿠키에 관리자 인증 정보 저장
                setCookie('adminToken', response.data.accessToken, 1);
                setCookie('adminId', response.data.userId, 1);
                setCookie('adminRefreshToken', response.data.refreshToken, 7);
                
                // 임시 세션 데이터 정리
                sessionStorage.removeItem('tempAdminToken');
                sessionStorage.removeItem('tempAdminId');
                sessionStorage.removeItem('tempAdminRefreshToken');

                // 대시보드로 이동
                window.location.href = '/admin/dashboard';
            } else {
                alert("인증 코드가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error("Verification Error:", error);
            if (error.response && error.response.status === 403) {
                alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
                navigate('/admin');
            } else {
                alert("인증 처리 중 오류가 발생했습니다.");
            }
        }
    };

    // 로딩 처리
    if (is2faEnabled === null) {
        return <div className="otp-loading">인증 상태를 확인 중입니다...</div>;
    }

    return (
        <div className="otp-verification-container">
            <div className="otp-form-card">
                <h2>2-Factor Authentication</h2>

                {/* 최초 등록자(is2faEnabled === false)에게만 QR 코드 섹션을 보여줌 */}
                {!is2faEnabled && (
                    <div className="qr-code-section">
                        <h3>1. QR 코드 스캔</h3>
                        <p>Google Authenticator 앱을 실행하여 아래 QR 코드를 스캔하세요.</p>
                        <div className="qr-image-wrapper">
                            {qrCode ? (
                                <img src={qrCode} alt="2FA QR Code" />
                            ) : (
                                <div className="qr-placeholder">QR 코드를 생성 중...</div>
                            )}
                        </div>
                        <hr />
                        <h3>2. 인증 코드 입력</h3>
                    </div>
                )}
                
                <p className="otp-instruction">
                    {is2faEnabled 
                        ? "앱에 표시된 6자리 인증 코드를 입력하세요." 
                        : "스캔 후 앱에 생성된 6자리 코드를 입력하여 등록을 완료하세요."}
                </p>

                <form onSubmit={handleOtpSubmit} className="otp-form">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // 숫자만 입력 가능하게
                        placeholder="000000"
                        maxLength="6"
                        className="otp-input"
                    />
                    <button type="submit" className="otp-verify-btn">인증 및 로그인</button>
                </form>
            </div>
        </div>
    );
};

export default OtpVerificationPage;