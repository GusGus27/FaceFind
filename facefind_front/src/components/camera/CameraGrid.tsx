import React from 'react';
import CameraCard from './CameraCard';
import '../../styles/camera/CameraGrid.css';

interface Camera {
    id?: number;
    nombre: string;
    type: 'USB' | 'IP';
    ubicacion: string;
    activa: boolean;
    url?: string;
    resolution?: string;
    fps?: number;
    ip?: string;
    latitud?: number;
    longitud?: number;
    created_at?: string;
    updated_at?: string;
}

interface CameraGridProps {
    cameras: Camera[];
    onEdit: (camera: Camera) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
}

const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onEdit, onDelete, onToggleStatus }) => {
    if (!cameras || cameras.length === 0) {
        return (
            <div className="camera-grid-empty">
                <div className="empty-state">
                    <i className="empty-icon">📹</i>
                    <h3>No hay cámaras registradas</h3>
                    <p>Agrega una nueva cámara para comenzar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="camera-grid">
            {cameras.map((camera) => (
                <CameraCard
                    key={camera.id}
                    camera={camera}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                />
            ))}
        </div>
    );
};

export default CameraGrid;
