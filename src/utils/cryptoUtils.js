import api from '../api/axiosConfig';
import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

// aes 키 생성
const generateWeakKey = () => {
  const timestampSec = Math.floor(new Date().getTime() / 1000);
    
    // 이 숫자를 MD5로 감싸서 키로 변환
    const key = CryptoJS.MD5(timestampSec.toString()).toString().substring(0, 16);
    
    console.log(`⏰ [초 단위 생성] 시각: ${timestampSec} -> 키: ${key}`);
    return key;
};

// [핵심] 로그인 시 호출될 키 교환 함수
export const performKeyExchange = async () => {
    try {
        console.log("🔐 키 교환 프로세스 시작...");

        // 1. 서버 공개키 요청
        const publicKeyRes = await api.get('/api/user/crypto/public-key');
        const serverPublicKey = publicKeyRes.data.publicKey;

        // 2. 취약한 대칭키 생성
        const aesKeyStr = generateWeakKey();

        // 3. RSA로 암호화하여 서버 전송
        const encryptor = new JSEncrypt();
        encryptor.setPublicKey(serverPublicKey);
        const encryptedAesKey = encryptor.encrypt(aesKeyStr);

        await api.post('/api/user/crypto/exchange-key', { 
            encryptedSymmetricKey: encryptedAesKey 
        });

        // 4. ★ 중요: 나중에 쓰기 위해 로컬 스토리지에 평문으로 저장 (취약점!)
        localStorage.setItem('sessionKey', aesKeyStr);
        
        console.log("✅ 키 교환 완료 및 저장됨");
        return true;

    } catch (error) {
        console.error("❌ 키 교환 실패:", error);
        return false;
    }
};