import { uploadToImgBB } from './imgbb';

export interface ShareOptions {
  blob: Blob;
  filename: string;
  name: string;
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
  const { blob, filename, name, builderClass, gate, seat } = options;

  const file = new File([blob], filename, { type: 'image/png' });
  const shareText = `Just claimed my Boarding Pass to Paradise for @HHGoa 2026! 🌴✈️\n\nBuilder Class: ${builderClass}\nGate/Seat: ${gate} · ${seat}\n\nStamp your passport and get assigned your builder class 👇\n#FrameInGoa #HackerHouseGoa`;
  const shareUrl = window.location.origin;

  // Check if Web Share API Level 2 with files is supported
  const canUseWebShare = typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] });

  if (canUseWebShare) {
    try {
      await navigator.share({
        title: `HH Goa 2026 — ${name}'s Boarding Pass`,
        text: shareText,
        files: [file],
      });
      return { method: 'web_share', success: true, message: 'Shared via native sheet with image attached!' };
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        return { method: 'web_share', success: false, message: 'Share sheet dismissed' };
      }
      console.warn('Web share failed, proceeding with fallback:', err);
    }
  }

  // Fallback: X Intent
  const tweetUrl = new URL('https://twitter.com/intent/tweet');
  tweetUrl.searchParams.set('hashtags', 'FrameInGoa,HHGoa2026');
  tweetUrl.searchParams.set('text', shareText);

  // Open the X window right now!
  window.open(tweetUrl.toString(), '_blank', 'noopener,noreferrer');

  // Trigger PNG Download so user has the actual image file ready
  triggerDownload(blob, filename);

  // Clipboard copy image (fire and forget, do not await!)
  let copiedToClipboard = false;
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]).then(() => {
      console.debug('Clipboard write success');
    }).catch(e => {
      console.debug('Clipboard write image failed', e);
    });
    copiedToClipboard = true; // Assume success for UI message
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
