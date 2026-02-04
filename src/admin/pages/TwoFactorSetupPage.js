import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TwoFactorSetupPage() {
    const [qrCode, setQrCode] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // [수정] .get 대신 .post를 사용하여 백엔드 @PostMapping과 일치시킵니다.
        axios.post('/api/admin/2fa/generate-secret')
            .then(res => {
                // 백엔드 응답 필드명(qrCodeDataUri) 확인
                setQrCode(res.data.qrCodeDataUri || res.data.qrCode);
            })
            .catch(err => {
                console.error("QR 코드 로드 실패:", err);
                alert("QR 코드를 불러오지 못했습니다. 서버 로그를 확인하세요.");
            });
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>2FA 인증 등록</h2>
                <p style={styles.text}>Google Authenticator 앱으로<br/>아래 QR 코드를 스캔해 주세요.</p>
                
                <div style={styles.qrWrapper}>
                    {qrCode ? (
                        <img src={qrCode} alt="2FA QR Code" style={styles.qrImage} />
                    ) : (
                        <div style={styles.loading}>QR 생성 중...</div>
                    )}
                </div>

                <button 
                    onClick={() => navigate('/admin/otp-verify', { state: { is2faEnabled: false } })}
                    style={styles.button}
                >
                    스캔 완료 후 인증하기
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
    card: { padding: '40px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' },
    title: { fontSize: '22px', marginBottom: '10px', color: '#333' },
    text: { fontSize: '14px', color: '#666', marginBottom: '25px', lineHeight: '1.5' },
    qrWrapper: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '25px', display: 'inline-block' },
    qrImage: { width: '200px', height: '200px' },
    loading: { width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' },
    button: { width: '100%', padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};