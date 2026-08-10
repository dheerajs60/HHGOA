import heic2any from 'heic2any';

/**
 * Converts HEIC/HEIF files (e.g. from iOS cameras) to standard JPEG/PNG data URL.
 * Passes regular image formats (JPEG, PNG, WebP) directly through.
 */
export async function convertHeicIfNeeded(file: File): Promise<string> {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif');

  if (!isHeic) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92,
    });

    const singleBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return URL.createObjectURL(singleBlob);
  } catch (error) {
    console.warn('HEIC client conversion failed, falling back to direct blob URL:', error);
    return URL.createObjectURL(file);
  }
}
