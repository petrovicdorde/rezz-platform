import type { SocialPlatform } from '@rezz/shared';

export function detectSocialPlatform(url: string): SocialPlatform {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('instagram.com')) return 'INSTAGRAM';
    if (hostname.includes('facebook.com') || hostname.includes('fb.com'))
      return 'FACEBOOK';
    if (hostname.includes('tiktok.com')) return 'TIKTOK';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be'))
      return 'YOUTUBE';
    return 'DEFAULT';
  } catch {
    return 'DEFAULT';
  }
}
