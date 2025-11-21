export const uploadFotos = async (formData) => {
  try {
    const response = await fetch("http://localhost:5000/fotos/upload", {
      method: "POST",
      body: formData, // no headers, porque se envía form-data
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al subir fotos");
    }

    const data = await response.json();
    console.log("✅ Fotos subidas:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en uploadFotos:", error);
    throw error;
  }
};

export const getFotosByCaso = async (casoId) => {
  try {
    const response = await fetch(`http://localhost:5000/fotos/caso/${casoId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al obtener fotos");
    }

    const data = await response.json();
    return data.fotos || [];
  } catch (error) {
    console.error("❌ Error en getFotosByCaso:", error);
    throw error;
  }
};

export const replaceFoto = async (fotoId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`http://localhost:5000/fotos/replace/${fotoId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al reemplazar foto");
    }

    const data = await response.json();
    console.log("✅ Foto reemplazada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en replaceFoto:", error);
    throw error;
  }
};

export const deleteFoto = async (fotoId) => {
  try {
    const response = await fetch(`http://localhost:5000/fotos/delete/${fotoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar foto");
    }

    const data = await response.json();
    console.log("✅ Foto eliminada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error en deleteFoto:", error);
    throw error;
  }
};
