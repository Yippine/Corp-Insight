import { useState, useCallback, memo } from "react";
import { MapPin, Navigation, Map, Info } from "lucide-react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

interface CompanyMapProps {
  address: string;
}

const defaultCenter = {
  lat: 25.033,
  lng: 121.5654,
};

const { VITE_GOOGLE_MAPS_API_KEY } = import.meta.env;

const CompanyMap = memo(({ address }: CompanyMapProps) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: VITE_GOOGLE_MAPS_API_KEY,
    language: "zh-TW",
    region: "TW",
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
        setMapState((prev) => ({
          ...prev,
          center: {
            lat: location.lat(),
            lng: location.lng(),
          },
          isLoaded: true,
        }));
      }
    } catch (error) {
      console.error("地址解析錯誤:", error);
    }
  }, [address]);

  const handleMapLoad = useCallback(() => {
    handleGeocoding();
  }, [handleGeocoding]);

  const handleOpenDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
      "_blank"
    );
  };

  const handleOpenFullMap = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      "_blank"
    );
  };

  const toggleInfo = () => {
    setMapState((prev) => ({
      ...prev,
      showInfo: !prev.showInfo,
    }));
  };

  if (loadError) {
    return <div className="text-red-500">地圖載入失敗</div>;
  }

  if (!isLoaded) {
    return (
      <div className="animate-pulse bg-gray-200 aspect-[16/9] w-full rounded-lg"></div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/95 rounded-lg shadow-lg px-4 pt-4 pb-2 max-w-[280px] border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.05]">
          <div className="space-y-3">
            <div className="flex items-start space-x-2.5">
              <div className="flex-shrink-0 p-1.5 bg-blue-50 rounded-lg">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-0.5">
                  公司地址
                </h4>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleOpenDirections}
                className="flex-1 group relative flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
                <Navigation className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:-rotate-12" />
                開始導航
              </button>
              <button
                onClick={handleOpenFullMap}
                className="flex-1 group flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 focus:ring-2 focus:ring-gray-200 active:scale-95"
              >
                <Map className="h-3.5 w-3.5 mr-1.5 transition-transform group-hover:scale-110" />
                詳細地圖
              </button>
            </div>

            <div className="pt-1.5 border-t border-gray-100">
              <p className="text-[10px] text-gray-500 flex items-center justify-center pt-1">
                <Info className="h-3 w-3 mr-1 text-gray-400" />
                點擊按鈕開啟 Google Maps
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="aspect-[16/9] w-full rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
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
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
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

CompanyMap.displayName = "CompanyMap";

export default CompanyMap;
