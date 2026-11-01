import path from "node:path";

const xmlEntities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };
const displayDateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export function slugFromInputPath(inputPath) {
  return path.basename(inputPath, path.extname(inputPath));
}

export function isPublishablePost(data) {
  return Boolean(data.title && data.date);
}

export function sortNewestFirst(posts) {
  return posts.toSorted((first, second) => second.date - first.date);
}

export function formatDisplayDate(date) {
  return displayDateFormat.format(date);
}

export function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function formatRfc822Date(date) {
  return date.toUTCString();
}

export function escapeXml(text) {
  return String(text).replace(/[&<>"']/g, (character) => xmlEntities[character]);
}

export function wrapCdata(text) {
  return `<![CDATA[${String(text).replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export function pageHref(pageNumber) {
  return pageNumber === 1 ? "/" : `/page/${pageNumber}/`;
}
