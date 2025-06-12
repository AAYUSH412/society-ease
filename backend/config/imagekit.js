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

export default imagekit;
