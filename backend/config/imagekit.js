import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

export const uploadImage = async (file, fileName, folder = 'society-ease') => {
  try {
    const result = await imagekit.upload({
      file: file, // required - file content as base64 string, buffer, or file path
      fileName: fileName, // required
      folder: folder,
      useUniqueFileName: true,
      tags: ['society-ease'],
    });
    
    return {
      success: true,
      data: result,
      url: result.url,
      fileId: result.fileId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteImage = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getImageUrl = (filePath, transformations = []) => {
  return imagekit.url({
    path: filePath,
    transformation: transformations
  });
};

// Get authentication parameters for client-side uploads
export const getAuthenticationParameters = () => {
  return imagekit.getAuthenticationParameters();
};

/**
 * Upload parking violation photo with specific tagging and folder structure
 * @param {Buffer|String} file - File content
 * @param {String} violationId - Violation ID for folder organization
 * @param {String} originalName - Original file name
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Upload result
 */
export const uploadViolationPhoto = async (file, violationId, originalName, metadata = {}) => {
  try {
    const fileName = `${violationId}_${Date.now()}_${originalName}`;
    const folder = `society-ease/parking-violations/${violationId}`;
    
    const result = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: [
        'parking-violation',
        'evidence',
        violationId,
        metadata.societyName || 'unknown-society',
        metadata.violationType || 'unknown-type'
      ],
      customMetadata: {
        violationId: violationId,
        uploadedBy: metadata.uploadedBy || 'unknown',
        uploadedAt: new Date().toISOString(),
        violationType: metadata.violationType || '',
        location: metadata.location || '',
        ...metadata
      }
    });
    
    return {
      success: true,
      data: result,
      url: result.url,
      fileId: result.fileId,
      thumbnailUrl: result.thumbnailUrl
    };
  } catch (error) {
    console.error('Error uploading violation photo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete multiple violation images
 * @param {Array} fileIds - Array of file IDs to delete
 * @returns {Object} Deletion result
 */
export const deleteViolationImages = async (fileIds) => {
  try {
    const results = await Promise.allSettled(
      fileIds.map(fileId => imagekit.deleteFile(fileId))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      success: failed === 0,
      deleted: successful,
      failed: failed,
      results: results
    };
  } catch (error) {
    console.error('Error deleting violation images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get optimized image URL for violation photo
 * @param {String} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {String} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'maintain_ratio',
    quality: 80,
    format: 'auto'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  // Build transformation string
  const transformations = [];
  if (finalOptions.width) transformations.push(`w-${finalOptions.width}`);
  if (finalOptions.height) transformations.push(`h-${finalOptions.height}`);
  if (finalOptions.crop) transformations.push(`c-${finalOptions.crop}`);
  if (finalOptions.quality) transformations.push(`q-${finalOptions.quality}`);
  if (finalOptions.format) transformations.push(`f-${finalOptions.format}`);
  
  const transformationString = transformations.join(',');
  
  // Insert transformations into URL
  if (url && url.includes('ik.imagekit.io')) {
    const urlParts = url.split('/');
    const endpointIndex = urlParts.findIndex(part => part.includes('ik.imagekit.io'));
    if (endpointIndex !== -1) {
      urlParts.splice(endpointIndex + 1, 0, `tr:${transformationString}`);
      return urlParts.join('/');
    }
  }
  
  return url;
};

/**
 * Get thumbnail URL for violation photo
 * @param {String} url - Original image URL
 * @returns {String} Thumbnail URL
 */
export const getThumbnailUrl = (url) => {
  return getOptimizedImageUrl(url, {
    width: 200,
    height: 150,
    crop: 'force',
    quality: 70
  });
};

/**
 * Validate single violation image
 * @param {Object} file - File object
 * @returns {Object} Validation result
 */
export const validateViolationImage = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push('File size exceeds 10MB limit');
  }
  
  if (!allowedTypes.includes(file.mimetype || file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, and WebP are allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate multiple violation images
 * @param {Array} files - Array of file objects
 * @returns {Object} Validation result
 */
export const validateViolationImages = (files) => {
  if (!files || files.length === 0) {
    return {
      isValid: false,
      errors: ['At least one photo is required for violation report']
    };
  }
  
  if (files.length > 5) {
    return {
      isValid: false,
      errors: ['Maximum 5 photos allowed per violation report']
    };
  }
  
  const errors = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  files.forEach((file, index) => {
    if (file.size > maxSize) {
      errors.push(`File ${index + 1}: Size exceeds 10MB limit`);
    }
    
    if (!allowedTypes.includes(file.mimetype || file.type)) {
      errors.push(`File ${index + 1}: Invalid file type. Only JPEG, PNG, and WebP are allowed`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default imagekit;
