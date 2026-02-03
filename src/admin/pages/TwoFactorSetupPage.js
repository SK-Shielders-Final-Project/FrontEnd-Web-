import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

const TwoFactorSetupPage = () => {
    const [qrCode, setQrCode] = useState('');
    const [manualKey, setManualKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await axios.get('/api/2fa/generate-secret');
                setQrCode(response.data.qrCode);
                setManualKey(response.data.manualKey);
            } catch (err) {
                setError('QR 코드를 불러오는 데 실패했습니다. 페이지를 새로고침해주세요.');
                console.error('Error fetching QR code:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchQrCode();
    }, []);

    if (loading) {
        return <div>QR 코드를 생성 중입니다...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div style={styles.container}>
            <h2>2단계 인증 (2FA) 설정</h2>
            <p>Google Authenticator 앱을 사용하여 아래 QR 코드를 스캔하세요.</p>
            <p>스캔이 불가능한 경우, 아래 제공된 키를 수동으로 입력하여 계정을 추가할 수 있습니다.</p>
            
            <div style={styles.qrCodeContainer}>
                {qrCode && <img src={qrCode} alt="2FA QR Code" />}
            </div>

            {manualKey && (
                <div style={styles.manualKeyContainer}>
                    <p>수동 입력 키:</p>
                    <code style={styles.manualKey}>{manualKey}</code>
                </div>
            )}
            
            <div style={styles.instructions}>
                <h4>다음 단계:</h4>
                <ol>
                    <li>Authenticator 앱에 계정이 추가되면 6자리 인증 코드가 생성됩니다.</li>
                    <li>아래 버튼을 클릭하여 OTP 입력 페이지로 이동합니다.</li>
                    <li>로그인 시, 비밀번호를 입력한 후 이 6자리 코드를 입력하여 인증을 완료합니다.</li>
                    <li><strong>참고:</strong> 이 QR코드는 페이지를 새로고침할 때마다 새로 생성될 수 있습니다. 한번만 등록하면 됩니다.</li>
                </ol>
                <button onClick={() => navigate('/admin/otp-verify')} style={styles.button}>
                    인증 완료 및 OTP 입력
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    qrCodeContainer: {
        margin: '2rem 0',
        padding: '1rem',
        display: 'inline-block',
        border: '1px solid #eee',
    },
    manualKeyContainer: {
        marginTop: '1rem',
    },
    manualKey: {
        padding: '0.5rem',
        background: '#f4f4f4',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'monospace',
        color: '#c7254e',
    },
    instructions: {
        marginTop: '2rem',
        textAlign: 'left',
        color: '#555',
    },
    button: {
        marginTop: '1.5rem',
        padding: '0.8rem 1.5rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    }
};

export default TwoFactorSetupPage;
