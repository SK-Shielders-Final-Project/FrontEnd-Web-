import api from '../api/axiosConfig';
import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';

// [취약점] Math.random()을 이용한 허술한 키 생성
const generateWeakKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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
        console.log("😈 생성된 세션 키(AES):", aesKeyStr);

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