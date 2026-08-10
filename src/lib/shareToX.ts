export interface ShareOptions {
  blob: Blob;
  filename: string;
  builderClass: string;
  format: string;
  gate: string;
  seat: string;
}

export interface ShareResult {
  method: 'web_share' | 'clipboard' | 'download_and_tweet' | 'download';
  success: boolean;
  message?: string;
}

/**
 * Executes the share flow prioritizing Web Share API Level 2 (native file attachment)
 * or fallback with ImgBB upload, or instant clipboard copy.
 */
export async function shareBoardingPassToX(options: ShareOptions): Promise<ShareResult> {
  const { blob, filename, builderClass, gate, seat } = options;

  const shareText = `Just claimed my Boarding Pass to Paradise for @HHGoa 2026! 🌴✈️\n\nBuilder Class: ${builderClass}\nGate/Seat: ${gate} · ${seat}\n\nStamp your passport and get assigned your builder class 👇\n#FrameInGoa #HackerHouseGoa`;

  // We explicitly bypass the native OS share sheet (navigator.share)
  // because the user requested that this button MUST route directly to X (Twitter),
  // rather than showing generic app options.

  // Fallback: X Intent
  const tweetUrl = new URL('https://twitter.com/intent/tweet');
  tweetUrl.searchParams.set('hashtags', 'FrameInGoa,HHGoa2026');
  tweetUrl.searchParams.set('text', shareText);

  // Open the X window right now!
  window.open(tweetUrl.toString(), '_blank', 'noopener,noreferrer');

  // Trigger PNG Download so user has the actual image file ready
  triggerDownload(blob, filename);

  // Clipboard copy image (await to catch errors and use Safari workaround)
  let copiedToClipboard = false;
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': Promise.resolve(blob),
        }),
      ]);
      copiedToClipboard = true;
    } catch (e) {
      console.warn('Clipboard write image failed', e);
    }
  }

  return {
    method: 'download_and_tweet',
    success: true,
    message: copiedToClipboard 
      ? 'Image copied to clipboard! Paste (Ctrl+V) into your tweet.' 
      : 'Card downloaded! Attach it to your tweet manually.',
  };
}

/**
 * Downloads a blob as a PNG file.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
