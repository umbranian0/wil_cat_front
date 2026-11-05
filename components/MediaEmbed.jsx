import { resolveMedia } from '@/lib/mediaEmbed';

// Shows a photo or an embedded video from a pasted link (YouTube, Vimeo,
// Instagram, TikTok, Cloudinary or a direct file link).
export default function MediaEmbed({ url, caption }) {
  const media = resolveMedia(url);

  let body;
  if (media.kind === 'iframe') {
    body = (
      <div className={`relative w-full overflow-hidden rounded-3xl bg-cream-200 ${media.vertical ? 'aspect-[9/16] max-w-[380px] mx-auto' : 'aspect-video'}`}>
        <iframe
          src={media.src}
          title={caption || 'Workshop video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  } else if (media.kind === 'video') {
    body = (
      <video src={media.src} controls playsInline preload="metadata" className="w-full rounded-3xl bg-cream-200" />
    );
  } else if (media.kind === 'image') {
    body = <img src={media.src} alt={caption || ''} loading="lazy" className="w-full rounded-3xl object-cover" />;
  } else {
    body = (
      <a
        href={media.src}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-3xl border-2 border-dashed border-terracotta/40 p-6 text-center font-sans text-sm font-semibold text-terracotta-dark hover:bg-cream-200"
      >
        Open link &rarr;
      </a>
    );
  }

  return (
    <figure className="m-0">
      {body}
      {caption && (
        <figcaption className="mt-3 text-center font-sans text-[13px] text-charcoal/75">{caption}</figcaption>
      )}
    </figure>
  );
}
