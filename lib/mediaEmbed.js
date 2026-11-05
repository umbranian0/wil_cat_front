// Turns a pasted photo/video link into something the page can show.
// Returns { kind: 'iframe' | 'video' | 'image' | 'link', src, vertical }.

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|webp|svg)(\?.*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function resolveMedia(rawUrl) {
  const url = String(rawUrl || '').trim();
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: 'link', src: url };
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return { kind: 'link', src: url };

  const host = parsed.hostname.replace(/^www\.|^m\./, '');
  const path = parsed.pathname;

  // YouTube: watch?v=, youtu.be/ID, /shorts/ID, /embed/ID
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    let id = parsed.searchParams.get('v');
    if (host === 'youtu.be') id = path.slice(1);
    const m = path.match(/^\/(shorts|embed|live)\/([\w-]+)/);
    if (m) id = m[2];
    if (id) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${id}`, vertical: m?.[1] === 'shorts' };
  }

  // Vimeo: vimeo.com/123456
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = path.match(/(\d{5,})/);
    if (m) return { kind: 'iframe', src: `https://player.vimeo.com/video/${m[1]}` };
  }

  // Instagram post / reel
  if (host === 'instagram.com') {
    const m = path.match(/^\/(p|reel|reels|tv)\/([\w-]+)/);
    if (m) return { kind: 'iframe', src: `https://www.instagram.com/${m[1] === 'reels' ? 'reel' : m[1]}/${m[2]}/embed`, vertical: true };
  }

  // TikTok video
  if (host === 'tiktok.com') {
    const m = path.match(/\/video\/(\d+)/);
    if (m) return { kind: 'iframe', src: `https://www.tiktok.com/embed/v2/${m[1]}`, vertical: true };
  }

  // Cloudinary or any direct file link
  if (VIDEO_EXT.test(path) || (host === 'res.cloudinary.com' && path.includes('/video/upload/'))) {
    return { kind: 'video', src: url };
  }
  if (IMAGE_EXT.test(path) || (host === 'res.cloudinary.com' && path.includes('/image/upload/'))) {
    return { kind: 'image', src: url };
  }

  return { kind: 'link', src: url };
}
