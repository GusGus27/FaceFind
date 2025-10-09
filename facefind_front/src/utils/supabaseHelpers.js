/**
 * Supabase Helper Functions
 * Utility functions for working with Supabase
 * @module utils/supabaseHelpers
 */

import { supabase } from '../lib/supabase';

/**
 * Format Supabase error into user-friendly message
 * @param {Error} error - The error object from Supabase
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (!error) return 'An unknown error occurred';

  // Handle specific Supabase error codes
  const errorMap = {
    '23505': 'This record already exists',
    '23503': 'Referenced record does not exist',
    '23502': 'Required field is missing',
    '42P01': 'Table does not exist',
    'PGRST116': 'No rows found',
    '22P02': 'Invalid input data type',
  };

  if (error.code && errorMap[error.code]) {
    return errorMap[error.code];
  }

  if (error.message) {
    // Clean up common Supabase error messages
    if (error.message.includes('duplicate key')) {
      return 'This record already exists';
    }
    if (error.message.includes('violates foreign key')) {
      return 'Cannot delete: related records exist';
    }
    if (error.message.includes('violates not-null')) {
      return 'Required fields are missing';
    }
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Handle Supabase errors with logging
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 * @throws {Error} Formatted error
 */
export const handleSupabaseError = (error, context = '') => {
  const message = formatError(error);
  const fullMessage = context ? `${context}: ${message}` : message;

  console.error(`[Supabase Error] ${fullMessage}`, error);

  throw new Error(fullMessage);
};

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The file path in the bucket
 * @returns {Promise<{path: string, url: string}>} Upload result
 */
export const uploadImage = async (file, bucket, path) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  } catch (error) {
    handleSupabaseError(error, 'Failed to upload image');
  }
};

/**
 * Get public URL for a file in storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The file path in the bucket
 * @returns {string} Public URL
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete a file from storage
 * @param {string} bucket - The storage bucket name
 * @param {string} path - The file path in the bucket
 * @returns {Promise<void>}
 */
export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    handleSupabaseError(error, 'Failed to delete file');
  }
};

/**
 * Build a query with pagination
 * @param {import('@supabase/supabase-js').PostgrestQueryBuilder} query - The base query
 * @param {number} page - Page number (0-indexed)
 * @param {number} pageSize - Items per page
 * @returns {import('@supabase/supabase-js').PostgrestQueryBuilder} Query with pagination
 */
export const paginate = (query, page = 0, pageSize = 10) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
};

/**
 * Execute a query with error handling
 * @param {Promise} queryPromise - The Supabase query promise
 * @param {string} errorContext - Context for error messages
 * @returns {Promise<any>} Query result data
 */
export const executeQuery = async (queryPromise, errorContext = '') => {
  try {
    const { data, error } = await queryPromise;

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, errorContext);
  }
};

/**
 * Build filter conditions for a query
 * @param {import('@supabase/supabase-js').PostgrestQueryBuilder} query - The base query
 * @param {Object} filters - Filter object with column: value pairs
 * @returns {import('@supabase/supabase-js').PostgrestQueryBuilder} Query with filters
 */
export const applyFilters = (query, filters = {}) => {
  let filteredQuery = query;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filteredQuery = filteredQuery.eq(key, value);
    }
  });

  return filteredQuery;
};

/**
 * Subscribe to real-time changes on a table
 * @param {string} table - Table name
 * @param {Function} callback - Callback function for changes
 * @param {string} event - Event type ('INSERT', 'UPDATE', 'DELETE', '*')
 * @param {string} filter - Optional filter (e.g., 'id=eq.123')
 * @returns {Object} Subscription object with unsubscribe method
 */
export const subscribeToTable = (table, callback, event = '*', filter = '') => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table,
        filter,
      },
      callback
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
};

/**
 * Format date for database insertion
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForDB = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Format datetime for database insertion
 * @param {Date|string} date - Datetime to format
 * @returns {string} Formatted datetime string (ISO 8601)
 */
export const formatDateTimeForDB = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Parse database date to JavaScript Date
 * @param {string} dateString - Date string from database
 * @returns {Date|null} Parsed date or null
 */
export const parseDBDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

/**
 * Generate unique filename for uploads
 * @param {string} originalName - Original file name
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique filename
 */
export const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');

  return prefix
    ? `${prefix}_${timestamp}_${randomString}_${baseName}.${extension}`
    : `${timestamp}_${randomString}_${baseName}.${extension}`;
};
