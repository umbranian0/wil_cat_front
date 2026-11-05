// Helpers to read a workshop CMS page (type "workshop").
// Blocks: one "workshop_info" block + any number of "workshop_media" blocks.

export function workshopInfo(page) {
  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  return blocks.find((b) => b?.type === 'workshop_info') || {};
}

export function workshopMedia(page) {
  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];
  return blocks.filter((b) => b?.type === 'workshop_media' && b.url);
}

export function formatWorkshopDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Lisbon' });
}
