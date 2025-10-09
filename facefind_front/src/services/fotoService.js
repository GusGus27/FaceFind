/**
 * Photo Service
 * Handles photo uploads and FotoReferencia CRUD operations
 * @module services/fotoService
 */

import { supabase } from '../lib/supabase';
import {
  handleSupabaseError,
  executeQuery,
  uploadImage,
  deleteFile,
  getPublicUrl,
  generateUniqueFilename
} from '../utils/supabaseHelpers';
import { FOTO_ANGULO } from '../constants/enums';

const BUCKET_NAME = 'fotos-referencia';

/**
 * Upload photo to Supabase Storage
 * @param {File} file - Image file
 * @param {number} casoId - Case ID
 * @param {string} angulo - Photo angle (IZQUIERDO, FRONTAL, DERECHO)
 * @returns {Promise<{path: string, url: string}>} Upload result
 */
export const uploadFotoToStorage = async (file, casoId, angulo) => {
  try {
    // Validate angle
    if (!Object.values(FOTO_ANGULO).includes(angulo)) {
      throw new Error(`Invalid angle. Must be one of: ${Object.values(FOTO_ANGULO).join(', ')}`);
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name, `${casoId}_${angulo}`);
    const filePath = `${casoId}/${filename}`;

    // Upload to storage
    const result = await uploadImage(file, BUCKET_NAME, filePath);

    return result;
  } catch (error) {
    handleSupabaseError(error, 'Failed to upload photo to storage');
  }
};

/**
 * Save photo reference to database
 * @param {Object} fotoData - Photo data
 * @param {number} fotoData.caso_id - Case ID
 * @param {string} fotoData.ruta_archivo - File path in storage
 * @param {string} fotoData.angulo - Photo angle
 * @param {Object} [fotoData.metadata] - Additional metadata
 * @returns {Promise<Object>} Created photo reference
 */
export const saveFotoReferencia = async (fotoData) => {
  try {
    const { data, error } = await supabase
      .from('FotoReferencia')
      .insert({
        caso_id: fotoData.caso_id,
        ruta_archivo: fotoData.ruta_archivo,
        angulo: fotoData.angulo,
        metadata: fotoData.metadata || null,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Failed to save photo reference');
  }
};

/**
 * Upload photo and save reference (complete flow)
 * @param {File} file - Image file
 * @param {number} casoId - Case ID
 * @param {string} angulo - Photo angle
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<Object>} Complete photo data with URL
 */
export const uploadAndSaveFoto = async (file, casoId, angulo, metadata = {}) => {
  try {
    // 1. Upload to storage
    const { path, url } = await uploadFotoToStorage(file, casoId, angulo);

    // 2. Save reference to database
    const fotoRef = await saveFotoReferencia({
      caso_id: casoId,
      ruta_archivo: path,
      angulo,
      metadata: {
        ...metadata,
        original_name: file.name,
        size: file.size,
        type: file.type,
      },
    });

    // 3. Return complete data
    return {
      ...fotoRef,
      url,
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to upload and save photo');
  }
};

/**
 * Get photos by case ID
 * @param {number} casoId - Case ID
 * @returns {Promise<Object[]>} List of photos
 */
export const getFotosByCaso = async (casoId) => {
  try {
    const photos = await executeQuery(
      supabase
        .from('FotoReferencia')
        .select('*')
        .eq('caso_id', casoId)
        .order('created_at', { ascending: true }),
      'Failed to fetch photos'
    );

    // Add public URLs
    return photos.map(photo => ({
      ...photo,
      url: getPublicUrl(BUCKET_NAME, photo.ruta_archivo),
    }));
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch photos by case');
  }
};

/**
 * Get a single photo by ID
 * @param {number} fotoId - Photo ID
 * @returns {Promise<Object>} Photo data with URL
 */
export const getFotoById = async (fotoId) => {
  try {
    const photo = await executeQuery(
      supabase.from('FotoReferencia').select('*').eq('id', fotoId).single(),
      'Failed to fetch photo'
    );

    return {
      ...photo,
      url: getPublicUrl(BUCKET_NAME, photo.ruta_archivo),
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch photo by ID');
  }
};

/**
 * Delete a photo (from storage and database)
 * @param {number} fotoId - Photo ID
 * @returns {Promise<void>}
 */
export const deleteFoto = async (fotoId) => {
  try {
    // 1. Get photo data
    const photo = await executeQuery(
      supabase.from('FotoReferencia').select('*').eq('id', fotoId).single(),
      'Failed to fetch photo for deletion'
    );

    // 2. Delete from storage
    await deleteFile(BUCKET_NAME, photo.ruta_archivo);

    // 3. Delete from database
    const { error } = await supabase
      .from('FotoReferencia')
      .delete()
      .eq('id', fotoId);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete photo');
  }
};

/**
 * Delete all photos for a case
 * @param {number} casoId - Case ID
 * @returns {Promise<void>}
 */
export const deleteFotosByCaso = async (casoId) => {
  try {
    // 1. Get all photos for the case
    const photos = await getFotosByCaso(casoId);

    // 2. Delete each photo
    await Promise.all(photos.map(photo => deleteFoto(photo.id)));
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete photos by case');
  }
};

/**
 * Update photo metadata
 * @param {number} fotoId - Photo ID
 * @param {Object} metadata - New metadata
 * @returns {Promise<Object>} Updated photo
 */
export const updateFotoMetadata = async (fotoId, metadata) => {
  try {
    const { data, error } = await supabase
      .from('FotoReferencia')
      .update({ metadata })
      .eq('id', fotoId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      url: getPublicUrl(BUCKET_NAME, data.ruta_archivo),
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to update photo metadata');
  }
};

/**
 * Get photos by angle
 * @param {number} casoId - Case ID
 * @param {string} angulo - Photo angle
 * @returns {Promise<Object|null>} Photo or null
 */
export const getFotoByAngulo = async (casoId, angulo) => {
  try {
    const { data, error } = await supabase
      .from('FotoReferencia')
      .select('*')
      .eq('caso_id', casoId)
      .eq('angulo', angulo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No photo found
      }
      throw error;
    }

    return {
      ...data,
      url: getPublicUrl(BUCKET_NAME, data.ruta_archivo),
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to fetch photo by angle');
  }
};

/**
 * Check if all required angles are uploaded for a case
 * @param {number} casoId - Case ID
 * @returns {Promise<{complete: boolean, missing: string[]}>} Completion status
 */
export const checkFotosCompletion = async (casoId) => {
  try {
    const photos = await getFotosByCaso(casoId);
    const uploadedAngles = photos.map(p => p.angulo);
    const requiredAngles = Object.values(FOTO_ANGULO);
    const missing = requiredAngles.filter(angle => !uploadedAngles.includes(angle));

    return {
      complete: missing.length === 0,
      missing,
      uploaded: uploadedAngles,
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to check photos completion');
  }
};

/**
 * Replace existing photo for an angle
 * @param {File} file - New image file
 * @param {number} casoId - Case ID
 * @param {string} angulo - Photo angle
 * @param {Object} [metadata] - Additional metadata
 * @returns {Promise<Object>} New photo data
 */
export const replaceFoto = async (file, casoId, angulo, metadata = {}) => {
  try {
    // 1. Check if photo exists for this angle
    const existing = await getFotoByAngulo(casoId, angulo);

    // 2. Delete existing photo if found
    if (existing) {
      await deleteFoto(existing.id);
    }

    // 3. Upload new photo
    return await uploadAndSaveFoto(file, casoId, angulo, metadata);
  } catch (error) {
    handleSupabaseError(error, 'Failed to replace photo');
  }
};

/**
 * Get photo count by case
 * @param {number} casoId - Case ID
 * @returns {Promise<number>} Number of photos
 */
export const getFotoCountByCaso = async (casoId) => {
  try {
    const { count, error } = await supabase
      .from('FotoReferencia')
      .select('*', { count: 'exact', head: true })
      .eq('caso_id', casoId);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    handleSupabaseError(error, 'Failed to get photo count');
  }
};
