import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
  privateKey: config.IMAGE_KIT_PRIVATE_KEY,
});

export async function uploadFile(buffer, fileName, folder = 'scandine') {
  try {
    const result = await client.files.upload({
      file: buffer,
      fileName,
      folder,
    });

    return {
      url: result.url,
      fileId: result.fileId,
      fileName: result.name,
    };
  } catch (error) {
    throw new Error(`ImageKit upload failed: ${error.message}`);
  }
}

export async function uploadMultipleFiles(buffers, fileNames, folder = 'scandine') {
  try {
    const uploadPromises = buffers.map((buffer, index) =>
      client.files.upload({
        file: buffer,
        fileName: fileNames[index],
        folder,
      })
    );

    const results = await Promise.all(uploadPromises);

    return results.map((result) => ({
      url: result.url,
      fileId: result.fileId,
      fileName: result.name,
    }));
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
