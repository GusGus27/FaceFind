import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/camera/LocationPicker.css';

// Fix para iconos de Leaflet en React - usar CDN
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number, address?: string) => void;
}

// Componente interno para manejar clicks en el mapa
interface LocationMarkerProps {
    position: [number, number] | null;
    setPosition: (position: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
    useMapEvents({
        click(e: any) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position ? <Marker position={position} /> : null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
    latitude, 
    longitude, 
    onLocationChange 
}) => {
    const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
    const [address, setAddress] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searching, setSearching] = useState(false);
    const mapRef = useRef<any>(null);

    // Actualizar posición cuando cambian las props
    useEffect(() => {
        setPosition([latitude, longitude]);
    }, [latitude, longitude]);

    // Notificar cambios de posición al padre
    useEffect(() => {
        onLocationChange(position[0], position[1], address);
    }, [position, address]);

    // Búsqueda de dirección usando Nominatim (OpenStreetMap)
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const result = data[0];
                const newLat = parseFloat(result.lat);
                const newLng = parseFloat(result.lon);
                
                setPosition([newLat, newLng]);
                setAddress(result.display_name);
                
                // Centrar mapa en nueva ubicación
                if (mapRef.current) {
                    mapRef.current.setView([newLat, newLng], 15);
                }
            } else {
                alert('No se encontró la dirección. Intenta con otra búsqueda.');
            }
        } catch (error: unknown) {
            console.error('Error buscando dirección:', error);
            alert('Error al buscar la dirección. Intenta nuevamente.');
        } finally {
            setSearching(false);
        }
    };

    // Geocodificación inversa (coordenadas -> dirección)
    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();

            if (data && data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error: unknown) {
            console.error('Error en geocodificación inversa:', error);
        }
    };

    // Actualizar dirección cuando cambia la posición
    const handlePositionChange = (newPosition: [number, number]) => {
        setPosition(newPosition);
        reverseGeocode(newPosition[0], newPosition[1]);
    };

    // Usar ubicación actual del dispositivo
    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    setPosition(newPos);
                    reverseGeocode(newPos[0], newPos[1]);
                    
                    if (mapRef.current) {
                        mapRef.current.setView(newPos, 15);
                    }
                },
                (error: GeolocationPositionError) => {
                    console.error('Error obteniendo ubicación:', error);
                    alert('No se pudo obtener tu ubicación actual.');
                }
            );
        } else {
            alert('Tu navegador no soporta geolocalización.');
        }
    };

    return (
        <div className="location-picker">
            <div className="location-picker-header">
                <h3>📍 Seleccionar Ubicación de la Cámara</h3>
                <p className="helper-text">
                    Haz clic en el mapa para seleccionar la ubicación o busca una dirección
                </p>
            </div>

            {/* Barra de búsqueda */}
            <div className="location-search">
                <input
                    type="text"
                    placeholder="Buscar dirección (ej: Av. Arequipa, Lima, Perú)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="search-input"
                />
                <button 
                    onClick={handleSearch} 
                    disabled={searching}
                    className="btn-search"
                >
                    {searching ? '🔍 Buscando...' : '🔍 Buscar'}
                </button>
                <button 
                    onClick={useCurrentLocation}
                    className="btn-current-location"
                    title="Usar mi ubicación actual"
                >
                    📍 Mi Ubicación
                </button>
            </div>

            {/* Mapa interactivo */}
            <div className="map-container-picker">
                <MapContainer
                    // @ts-ignore - react-leaflet props compatibility
                    center={position}
                    zoom={13}
                    style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                    ref={mapRef}
                >
                    <TileLayer
                        // @ts-ignore - react-leaflet props compatibility
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handlePositionChange} />
                </MapContainer>
            </div>

            {/* Información de coordenadas */}
            <div className="location-info">
                <div className="coord-display">
                    <div className="coord-item">
                        <span className="coord-label">Latitud:</span>
                        <span className="coord-value">{position[0].toFixed(6)}</span>
                    </div>
                    <div className="coord-item">
                        <span className="coord-label">Longitud:</span>
                        <span className="coord-value">{position[1].toFixed(6)}</span>
                    </div>
                </div>
                
                {address && (
                    <div className="address-display">
                        <span className="address-label">📍 Dirección:</span>
                        <span className="address-value">{address}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
