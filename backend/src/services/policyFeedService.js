// policyFeedService.js — fetches and parses the real, official IRCC
// newsroom Atom feed from Government of Canada's public news API. No
// fabricated/mock news data — if the feed is unreachable, callers get an
// error and the frontend shows a "couldn't load" state rather than stale
// or invented content.
//
// This is the same feed served at canada.ca/en/immigration-refugees-citizenship/news/rss.html
// (verified against the live endpoint) — canada.ca's RSS/Atom pages are
// generated from this API rather than a static XML file.
const { XMLParser } = require("fast-xml-parser");

const FEED_URL =
  "https://api.io.canada.ca/io-server/gc/news/en/v2" +
  "?dept=departmentofcitizenshipandimmigration" +
  "&sort=publishedDate&orderBy=desc&pick=20&format=atom&atomtitle=IRCC%20News";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

// Fetched entries change a few times a week at most — cache for an hour so
// every Policy Updates page load doesn't hit the government API directly.
const CACHE_TTL_MS = 60 * 60 * 1000;
let cache = { data: null, fetchedAt: 0 };

function firstLink(entryLink) {
  const link = Array.isArray(entryLink) ? entryLink[0] : entryLink;
  return link?.["@_href"] ?? "";
}

function toItem(entry) {
  return {
    title: entry.title ?? "",
    link: firstLink(entry.link),
    summary: (entry.summary?.["#text"] ?? entry.summary ?? "").toString().trim(),
    category: entry.category?.["@_term"] ?? null,
    publishedAt: entry.updated ?? null,
  };
}

async function fetchIrccNews({ force = false } = {}) {
  if (!force && cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.data;
  }

  const res = await fetch(FEED_URL);
  if (!res.ok) {
    throw new Error(`IRCC feed returned ${res.status}`);
  }
  const xml = await res.text();
  const parsed = parser.parse(xml);

  const entries = parsed.feed?.entry;
  const list = Array.isArray(entries) ? entries : entries ? [entries] : [];
  const items = list.map(toItem).filter((i) => i.title && i.link);

  cache = { data: items, fetchedAt: Date.now() };
  return items;
}

module.exports = { fetchIrccNews, FEED_URL };
