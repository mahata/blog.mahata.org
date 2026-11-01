import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDisplayDate,
  formatIsoDate,
  formatRfc822Date,
  isPublishablePost,
  pageHref,
  slugFromInputPath,
  sortNewestFirst,
  wrapCdata,
} from "../lib/posts.js";

describe("slugFromInputPath", () => {
  it("keeps the date prefix of the file name", () => {
    assert.equal(slugFromInputPath("./posts/2023-01-13-generator.md"), "2023-01-13-generator");
  });
});

describe("isPublishablePost", () => {
  it("accepts posts with both title and date", () => {
    assert.equal(isPublishablePost({ title: "Hello", date: "2024-01-02" }), true);
  });

  it("rejects posts without a title", () => {
    assert.equal(isPublishablePost({ date: "2024-01-02" }), false);
  });

  it("rejects posts without a date", () => {
    assert.equal(isPublishablePost({ title: "Hello" }), false);
  });
});

describe("sortNewestFirst", () => {
  it("orders by date descending without mutating the input", () => {
    const olderPost = { date: new Date("2023-01-01"), inputPath: "a.md" };
    const newerPost = { date: new Date("2024-01-01"), inputPath: "b.md" };
    const original = [olderPost, newerPost];

    assert.deepEqual(sortNewestFirst(original), [newerPost, olderPost]);
    assert.deepEqual(original, [olderPost, newerPost]);
  });
});

describe("date formatting", () => {
  const midnightUtc = new Date("2023-02-13T00:00:00Z");

  it("formats display dates in UTC regardless of local time zone", () => {
    assert.equal(formatDisplayDate(midnightUtc), "February 13, 2023");
  });

  it("formats ISO calendar dates", () => {
    assert.equal(formatIsoDate(midnightUtc), "2023-02-13");
  });

  it("formats RFC 822 dates for RSS", () => {
    assert.equal(formatRfc822Date(midnightUtc), "Mon, 13 Feb 2023 00:00:00 GMT");
  });
});

describe("wrapCdata", () => {
  it("wraps text in a CDATA section", () => {
    assert.equal(wrapCdata("<b>hi</b>"), "<![CDATA[<b>hi</b>]]>");
  });

  it("splits embedded CDATA terminators", () => {
    assert.equal(wrapCdata("a]]>b"), "<![CDATA[a]]]]><![CDATA[>b]]>");
  });
});

describe("pageHref", () => {
  it("links the first page to the root", () => {
    assert.equal(pageHref(1), "/");
  });

  it("links later pages under /page/", () => {
    assert.equal(pageHref(3), "/page/3/");
  });
});
