import React, { useState, useRef } from 'react';
import { replaceFoto, deleteFoto } from '../../services/fotoService';
import '../../styles/fotos/PhotoManager.css';

const PhotoManager = ({ fotos, casoId, onPhotoUpdated }) => {
    const [loading, setLoading] = useState({});
    const [previews, setPreviews] = useState({});
    const fileInputRefs = useRef({});

    // Debug
    console.log('📸 PhotoManager renderizado con:', { 
        numFotos: fotos?.length, 
        casoId, 
        fotos 
    });

    const handleFileSelect = (fotoId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar los 5MB');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [fotoId]: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleReplace = async (fotoId) => {
        const fileInput = fileInputRefs.current[fotoId];
        if (!fileInput || !fileInput.files[0]) {
            alert('Por favor selecciona una imagen primero');
            return;
        }

        const confirmReplace = window.confirm(
            '¿Estás seguro de reemplazar esta foto? Esta acción eliminará los encodings antiguos y generará nuevos. El proceso puede tardar unos segundos.'
        );

        if (!confirmReplace) return;

        setLoading(prev => ({ ...prev, [fotoId]: true }));

        try {
            const file = fileInput.files[0];
            const result = await replaceFoto(fotoId, file);

            if (result.success) {
                alert('✅ Foto reemplazada exitosamente. Los encodings se han actualizado.');
                setPreviews(prev => {
                    const newPreviews = { ...prev };
                    delete newPreviews[fotoId];
                    return newPreviews;
                });
                fileInput.value = '';
                
                // Notificar al componente padre para recargar
                if (onPhotoUpdated) onPhotoUpdated();
            }
        } catch (error) {
            console.error('Error reemplazando foto:', error);
            alert('❌ Error al reemplazar la foto: ' + error.message);
        } finally {
            setLoading(prev => ({ ...prev, [fotoId]: false }));
        }
    };

    const handleDelete = async (fotoId) => {
        const confirmDelete = window.confirm(
            '¿Estás seguro de eliminar esta foto? Esta acción también eliminará sus encodings y no se puede deshacer.'
        );

        if (!confirmDelete) return;

        setLoading(prev => ({ ...prev, [fotoId]: true }));

        try {
            const result = await deleteFoto(fotoId);

            if (result.success) {
                alert('✅ Foto eliminada exitosamente');
                
                // Notificar al componente padre para recargar
                if (onPhotoUpdated) onPhotoUpdated();
            }
        } catch (error) {
            console.error('Error eliminando foto:', error);
            alert('❌ Error al eliminar la foto: ' + error.message);
        } finally {
            setLoading(prev => ({ ...prev, [fotoId]: false }));
        }
    };

    const handleCancelPreview = (fotoId) => {
        setPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[fotoId];
            return newPreviews;
        });
        
        if (fileInputRefs.current[fotoId]) {
            fileInputRefs.current[fotoId].value = '';
        }
    };

    if (!fotos || fotos.length === 0) {
        console.log('⚠️ PhotoManager: No hay fotos para mostrar');
        return (
            <div className="photo-manager-empty">
                <p>No hay fotos de referencia para este caso</p>
                <p style={{ fontSize: '0.9em', color: '#999' }}>
                    Sube fotos desde el formulario de registro de caso
                </p>
            </div>
        );
    }

    console.log('✅ PhotoManager: Renderizando', fotos.length, 'fotos');

    return (
        <div className="photo-manager" style={{ 
            margin: '20px 0', 
            padding: '20px', 
            background: '#f8f9fa',
            borderRadius: '8px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Fotos de Referencia</h3>
            <p className="photo-manager-subtitle" style={{ color: '#666', marginBottom: '20px' }}>
                Puedes reemplazar cualquier foto. Los encodings se actualizarán automáticamente.
            </p>
            
            <div className="photos-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
            }}>
                {fotos.map((foto, index) => {
                    console.log(`🖼️ Renderizando foto ${index + 1}:`, foto);
                    return (
                    <div key={foto.id} className="photo-card" style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '15px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div className="photo-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            paddingBottom: '10px',
                            borderBottom: '2px solid #e9ecef'
                        }}>
                            <span className="photo-number" style={{ fontWeight: '600', color: '#2c3e50' }}>
                                Foto {index + 1}
                            </span>
                            <span className="photo-id" style={{
                                fontSize: '0.85em',
                                color: '#999',
                                background: '#f0f0f0',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}>
                                ID: {foto.id}
                            </span>
                        </div>

                        <div className="photo-preview" style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            background: '#f0f0f0',
                            marginBottom: '12px',
                            position: 'relative'
                        }}>
                            <img
                                src={previews[foto.id] || foto.url_foto || foto.ruta_archivo}
                                alt={`Referencia ${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200x200?text=Error+Cargando';
                                }}
                            />
                            {previews[foto.id] && (
                                <div className="preview-overlay" style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(52, 152, 219, 0.9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '600'
                                }}>
                                    <span>Nueva imagen seleccionada</span>
                                </div>
                            )}
                        </div>

                        <div className="photo-actions" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '8px',
                            marginTop: '12px'
                        }}>
                            {console.log(`🔘 Renderizando botones para foto ${foto.id}, preview:`, !!previews[foto.id])}
                            <input
                                type="file"
                                ref={el => fileInputRefs.current[foto.id] = el}
                                accept="image/*"
                                onChange={(e) => handleFileSelect(foto.id, e)}
                                style={{ display: 'none' }}
                                id={`file-input-${foto.id}`}
                            />

                            {!previews[foto.id] ? (
                                <>
                                    <label
                                        htmlFor={`file-input-${foto.id}`}
                                        className="btn btn-select"
                                        style={{
                                            display: 'block',
                                            padding: '10px 15px',
                                            background: '#3498db',
                                            color: 'white',
                                            borderRadius: '6px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        📁 Seleccionar Nueva
                                    </label>
                                    <button
                                        onClick={() => handleDelete(foto.id)}
                                        className="btn btn-delete"
                                        disabled={loading[foto.id]}
                                        style={{
                                            padding: '10px 15px',
                                            background: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        {loading[foto.id] ? '⏳' : '🗑️'} Eliminar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleReplace(foto.id)}
                                        className="btn btn-confirm"
                                        disabled={loading[foto.id]}
                                        style={{
                                            padding: '10px 15px',
                                            background: '#27ae60',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        {loading[foto.id] ? '⏳ Procesando...' : '✅ Confirmar Reemplazo'}
                                    </button>
                                    <button
                                        onClick={() => handleCancelPreview(foto.id)}
                                        className="btn btn-cancel"
                                        disabled={loading[foto.id]}
                                        style={{
                                            padding: '10px 15px',
                                            background: '#95a5a6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        ❌ Cancelar
                                    </button>
                                </>
                            )}
                        </div>

                        {loading[foto.id] && (
                            <div className="photo-loading" style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(255,255,255,0.95)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                zIndex: 10
                            }}>
                                <div className="spinner" style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '4px solid #f3f3f3',
                                    borderTop: '4px solid #3498db',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                <p>Procesando foto y generando encodings...</p>
                            </div>
                        )}
                    </div>
                    );
                })}
            </div>

            <div className="photo-manager-info" style={{
                background: '#e3f2fd',
                padding: '15px',
                borderRadius: '6px',
                borderLeft: '4px solid #2196f3'
            }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: '600' }}>ℹ️ Al reemplazar una foto:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Se eliminan los encodings antiguos de la base de datos</li>
                    <li>Se genera un nuevo encoding para la nueva foto</li>
                    <li>El modelo de reconocimiento se actualiza automáticamente</li>
                    <li>El proceso puede tardar unos segundos</li>
                </ul>
            </div>
        </div>
    );
};

export default PhotoManager;
