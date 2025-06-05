'use client';

import { useState, useCallback, memo } from 'react';
import { MapPin, Navigation, Map, Info } from 'lucide-react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';

interface CompanyMapProps {
  address: string;
}

const defaultCenter = {
  lat: 25.033,
  lng: 121.5654,
};

const CompanyMap = memo(({ address }: CompanyMapProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    language: 'zh-TW',
    region: 'TW',
  });

  const [mapState, setMapState] = useState({
    center: defaultCenter,
    isLoaded: false,
    showInfo: false,
  });

  const handleGeocoding = useCallback(async () => {
    if (!window.google) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await geocoder.geocode({ address });

      if (results.results[0]) {
        const location = results.results[0].geometry.location;
        setMapState(prev => ({
          ...prev,
          center: {
            lat: location.lat(),
            lng: location.lng(),
          },
          isLoaded: true,
        }));
      }
    } catch (error) {
      console.error('地址解析錯誤:', error);
    }
  }, [address]);

  const handleMapLoad = useCallback(() => {
    handleGeocoding();
  }, [handleGeocoding]);

  const handleOpenDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  const handleOpenFullMap = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  const toggleInfo = () => {
    setMapState(prev => ({
      ...prev,
      showInfo: !prev.showInfo,
    }));
  };

  if (loadError) {
    return <div className="text-red-500">地圖載入失敗</div>;
  }

  if (!isLoaded) {
    return (
      <div className="aspect-[16/9] w-full animate-pulse rounded-lg bg-gray-200"></div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-4 z-10">
        <div className="max-w-[280px] rounded-lg border border-gray-100 bg-white/95 px-4 pb-2 pt-4 shadow-lg transition-all duration-300 hover:scale-[1.05] hover:shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start space-x-2.5">
              <div className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="mb-0.5 text-xs font-medium text-gray-500">
                  公司地址
                </h4>
                <p className="text-sm font-medium leading-relaxed text-gray-900">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleOpenDirections}
                className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
              >
                <div className="animate-shimmer absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%]"></div>
                <Navigation className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-rotate-12" />
                開始導航
              </button>
              <button
                onClick={handleOpenFullMap}
                className="group flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 active:scale-95"
              >
                <Map className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                詳細地圖
              </button>
            </div>

            <div className="border-t border-gray-100 pt-1.5">
              <p className="flex items-center justify-center pt-1 text-[10px] text-gray-500">
                <Info className="mr-1 h-3 w-3 text-gray-400" />
                點擊按鈕開啟 Google Maps
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100%',
          }}
          center={mapState.center}
          zoom={16}
          onLoad={handleMapLoad}
          options={{
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {mapState.isLoaded && (
            <Marker
              position={mapState.center}
              onClick={toggleInfo}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            >
              {mapState.showInfo && (
                <InfoWindow
                  position={mapState.center}
                  onCloseClick={toggleInfo}
                >
                  <div className="p-2">
                    <p className="font-medium text-gray-900">{address}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>
      </div>
    </div>
  );
});

CompanyMap.displayName = 'CompanyMap';

export default CompanyMap;
