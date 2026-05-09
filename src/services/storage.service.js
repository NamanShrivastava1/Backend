import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadFile(buffer, fileName, folder = 'scandine') {
  try {
    // Ensure buffer is in the correct format
    const fileBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    const result = await client.files.upload({
      file: fileBuffer,
      fileName,
      folder: `/${folder}`, // Ensure folder starts with /
    });

    return {
      url: result.url,
      fileId: result.fileId,
      fileName: result.name,
    };
  } catch (error) {
    console.error('ImageKit upload error details:', error);
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
}

export async function uploadMultipleFiles(buffers, fileNames, folder = 'scandine') {
  try {
    const results = [];

    // Upload files sequentially to avoid rate limiting
    for (let i = 0; i < buffers.length; i++) {
      try {
        // Ensure buffer is in the correct format
        const fileBuffer = Buffer.isBuffer(buffers[i]) ? buffers[i] : Buffer.from(buffers[i]);

        const result = await client.files.upload({
          file: fileBuffer,
          fileName: fileNames[i],
          folder: `/${folder}`, // Ensure folder starts with /
        });

        results.push({
          url: result.url,
          fileId: result.fileId,
          fileName: result.name,
        });
      } catch (uploadError) {
        // If one upload fails, clean up already uploaded files
        for (const uploaded of results) {
          try {
            await deleteFile(uploaded.fileId);
          } catch (cleanupError) {
            console.warn(`Failed to cleanup file ${uploaded.fileId}:`, cleanupError.message);
          }
        }
        throw new Error(`Failed to upload file ${fileNames[i]}: ${uploadError.message}`);
      }
    }

    return results;
  } catch (error) {
    throw new Error(`ImageKit batch upload failed: ${error.message}`);
  }
}

export async function deleteFile(fileId) {
  try {
    await client.files.delete(fileId);
    return true;
  } catch (error) {
    throw new Error(`ImageKit delete failed: ${error.message}`);
  }
}
