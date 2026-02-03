import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { getBikesNearbyAsXml } from '../../api/mapApi';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 37.5665, // 초기 중심 위도 (서울시청)
  lng: 126.9780  // 초기 중심 경도
};

function MapContainer() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [bikes, setBikes] = useState([]);

  const handleMapClick = useCallback(async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    alert(`선택한 위치의 위도: ${lat}\n이 위치를 기준으로 주변 자전거를 탐색합니다.`);

    try {
      const xmlText = await getBikesNearbyAsXml(lat, lng);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      
      // MapResponseDTO의 새로운 구조를 파싱
      const exploitedLatNode = xmlDoc.getElementsByTagName('exploitedLatitude')[0];
      const exploitedLatitude = exploitedLatNode ? exploitedLatNode.textContent : 'Not found';

      const bikeNodes = xmlDoc.getElementsByTagName('bikes')[0].getElementsByTagName('bike'); // bikes 태그 아래 bike 태그
      const newBikes = Array.from(bikeNodes).map(node => ({
        id: node.getAttribute('id'),
        latitude: parseFloat(node.getElementsByTagName('latitude')[0].textContent),
        longitude: parseFloat(node.getElementsByTagName('longitude')[0].textContent),
      }));

      setBikes(newBikes);
      let alertMessage = `위치: ${exploitedLatitude}\n`;
      if (newBikes.length > 0) {
        alertMessage += `${newBikes.length}개의 자전거 정보를 DB에서 불러왔습니다.`;
      } else {
        alertMessage += `주변에 자전거 정보가 없습니다.`;
      }
      alert(alertMessage);

    } catch (error) {
      console.error('자전거 정보 로딩 중 에러 발생:', error);
      alert("자전거 정보를 불러오는 데 실패했습니다.");
    }
  }, []);

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleMapClick}
      >
        {bikes.map(bike => (
          <Marker
            key={bike.id}
            position={{ lat: bike.latitude, lng: bike.longitude }}
          />
        ))}
      </GoogleMap>
  ) : <div>Loading...</div>
}

export default React.memo(MapContainer);