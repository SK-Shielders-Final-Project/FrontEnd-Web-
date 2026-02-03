import axios from './axiosConfig';

export const getBikesNearbyAsXml = async (lat, lng) => {
    // 서버로 보낼 XML 요청 생성
    const xmlRequest = `
      <userRequest>
        <lat>${lat}</lat>
        <lng>${lng}</lng>
      </userRequest>
    `;

    try {
        const response = await axios.post('/api/map/bikes-nearby', xmlRequest, {
            headers: { 'Content-Type': 'application/xml' }
        });
        return response.data; // XML 텍스트가 반환됨
    } catch (error) {
        console.error('Error fetching nearby bikes:', error);
        throw error;
    }
};