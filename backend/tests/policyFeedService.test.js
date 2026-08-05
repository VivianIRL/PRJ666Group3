const SAMPLE_ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>IRCC News</title>
  <entry>
    <title>Canada expands online passport renewal to all eligible adults</title>
    <id>https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/07/example.html</id>
    <summary type="html">The Government of Canada is committed to making life simpler.</summary>
    <author><name>Immigration, Refugees and Citizenship Canada</name></author>
    <category term="news releases"/>
    <updated>2026-07-28T13:18:00-04:00</updated>
    <link href="https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/07/example.html"/>
  </entry>
  <entry>
    <title>Second announcement</title>
    <id>https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/07/second.html</id>
    <summary type="html">Another update from IRCC.</summary>
    <author><name>Immigration, Refugees and Citizenship Canada</name></author>
    <category term="notices"/>
    <updated>2026-07-20T09:00:00-04:00</updated>
    <link href="https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/07/second.html"/>
  </entry>
</feed>`;

describe("fetchIrccNews", () => {
  let originalFetch;

  beforeEach(() => {
    jest.resetModules();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("parses real Atom feed entries into a clean item shape", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ATOM),
    });
    const { fetchIrccNews } = require("../src/services/policyFeedService");

    const items = await fetchIrccNews({ force: true });

    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      title: "Canada expands online passport renewal to all eligible adults",
      link: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/07/example.html",
      summary: "The Government of Canada is committed to making life simpler.",
      category: "news releases",
      publishedAt: "2026-07-28T13:18:00-04:00",
    });
  });

  test("caches results and does not re-fetch within the TTL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_ATOM),
    });
    const { fetchIrccNews } = require("../src/services/policyFeedService");

    await fetchIrccNews({ force: true });
    await fetchIrccNews();

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("throws when the feed is unreachable, rather than returning fabricated data", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    const { fetchIrccNews } = require("../src/services/policyFeedService");

    await expect(fetchIrccNews({ force: true })).rejects.toThrow("IRCC feed returned 503");
  });
});
