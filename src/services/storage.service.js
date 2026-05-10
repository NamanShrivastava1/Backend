import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

function getFolderPath(folder) {
  if (!folder) return '/scandine';
  return folder.startsWith('/') ? folder : `/${folder}`;
}

function getImageKitFileData(file) {
  let buffer;
  let mimetype = 'application/octet-stream';

  if (Buffer.isBuffer(file)) {
    buffer = file;
  } else if (file && file.buffer && file.mimetype) {
    buffer = file.buffer;
    mimetype = file.mimetype;
  } else if (typeof file === 'string') {
    return file;
  } else {
    throw new Error('Invalid file data for upload');
  }

  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

export async function uploadFile(file, fileName, folder = 'scandine') {
  try {
    const fileData = getImageKitFileData(file);

    const result = await client.files.upload({
      file: fileData,
      fileName,
      folder: getFolderPath(folder),
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

export async function uploadMultipleFiles(files, fileNames, folder = 'scandine') {
  try {
    const results = [];
    const folderPath = getFolderPath(folder);

    for (let i = 0; i < files.length; i++) {
      try {
        const fileData = getImageKitFileData(files[i]);

        const result = await client.files.upload({
          file: fileData,
          fileName: fileNames[i],
          folder: folderPath,
        });

        results.push({
          url: result.url,
          fileId: result.fileId,
          fileName: result.name,
        });
      } catch (uploadError) {
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
