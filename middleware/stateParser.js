/**
 * JSON.parse의 한계를 극복하기 위해 생성
 * 클라이언트에서 받은 Serialized JS 객체 문자열을 실행 가능한 객체로 Deserialize
 * 용도 : OG Tag 미리보기 테스트, A/B 테스트용 상태 주입
 */
const serialize = require('node-serialize');

const deserializeState = (serializedJs) => {
    try {
        return serialize.unserialize(serializedJs)
    } catch (e) {
        console.error("State Parser Error:", e.message);
        return { 
            parseError: true, 
            message: e.message 
        };
    }
};

module.exports = {deserializeState};