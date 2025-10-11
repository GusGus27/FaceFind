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
