import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { buildSite, numberedPosts, post, repositoryRoot } from "./helpers/build-site.js";

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
}

function useBuild(options) {
  const context = {};
  before(() => {
    context.site = buildSite(options);
    assert.equal(context.site.exitCode, 0, context.site.log);
  });
  after(() => context.site.cleanup());
  return context;
}

describe("site with no posts", () => {
  const context = useBuild({ posts: {} });

  it("shows an empty state without pagination", () => {
    const home = context.site.read("index.html");
    assert.match(home, /No posts found\./);
    assert.doesNotMatch(home, /Pagination Navigation/);
  });

  it("publishes an RSS feed without items", () => {
    const feed = context.site.read("rss.xml");
    assert.match(feed, /<title>mahata\.or blog<\/title>/);
    assert.equal(countMatches(feed, /<item>/g), 0);
  });
});

describe("site with a single post", () => {
  const context = useBuild({
    posts: {
      "2024-01-02-hello.md": post({ title: "Hello", date: "2024-01-02", body: "Some *emphasis*." }),
    },
  });

  it("renders the post body under /posts/<file name>/", () => {
    const page = context.site.read("posts/2024-01-02-hello/index.html");
    assert.match(page, /<article class="article">\s*<p>Some <em>emphasis<\/em>\.<\/p>/);
    assert.match(page, /<title>Hello - 漬け水が胡瓜に漬かるより胡瓜が漬け水に漬かるほうが早いブログ<\/title>/);
    assert.match(page, /<a href="\/" class="backButton" aria-label="Back to home">\s*<svg/);
  });

  it("lists the post on the home page with its date", () => {
    const home = context.site.read("index.html");
    assert.match(home, /<a href="\/posts\/2024-01-02-hello\/" class="postLink">Hello<\/a>/);
    assert.match(home, /<time class="postDate" datetime="2024-01-02">January 2, 2024<\/time>/);
    assert.doesNotMatch(home, /Pagination Navigation/);
  });

  it("shares the layout with logo, stylesheet, favicon and feed discovery", () => {
    const home = context.site.read("index.html");
    assert.match(home, /<html lang="en">/);
    assert.match(home, /<a href="\/" aria-label="Go to home">\s*<img src="\/logo\.webp" alt="Logo" class="logo"/);
    assert.match(home, /<link rel="stylesheet" href="\/styles\.css">/);
    assert.match(home, /<link rel="icon" type="image\/webp" href="\/logo\.webp">/);
    assert.match(home, /<link rel="alternate" type="application\/rss\+xml"[^>]*href="\/rss\.xml">/);
  });

  it("publishes the RSS item with a stable link and raw Markdown description", () => {
    const feed = context.site.read("rss.xml");
    assert.match(feed, /<link>https:\/\/blog\.mahata\.org<\/link>/);
    assert.match(feed, /<title><!\[CDATA\[Hello\]\]><\/title>/);
    assert.match(feed, /<link>https:\/\/blog\.mahata\.org\/posts\/2024-01-02-hello<\/link>/);
    assert.match(
      feed,
      /<guid isPermaLink="false">https:\/\/blog\.mahata\.org\/posts\/2024-01-02-hello<\/guid>/,
    );
    assert.match(feed, /<pubDate>Tue, 02 Jan 2024 00:00:00 GMT<\/pubDate>/);
    assert.match(feed, /<description><!\[CDATA\[Some \*emphasis\*\.\n?\]\]><\/description>/);
  });

  it("publishes the sitemap with the root and the post", () => {
    const sitemap = context.site.read("sitemap.xml");
    assert.match(
      sitemap,
      /<loc>https:\/\/blog\.mahata\.org<\/loc>\s*<changefreq>weekly<\/changefreq>\s*<priority>1\.0<\/priority>/,
    );
    assert.match(
      sitemap,
      /<loc>https:\/\/blog\.mahata\.org\/posts\/2024-01-02-hello<\/loc>\s*<lastmod>2024-01-02<\/lastmod>\s*<changefreq>monthly<\/changefreq>\s*<priority>0\.7<\/priority>/,
    );
  });

  it("provides static health, feed redirect and not-found pages", () => {
    assert.equal(context.site.read("health/index.html").trim(), "OK");
    const feedRedirect = context.site.read("feed/index.html");
    assert.match(feedRedirect, /<meta http-equiv="refresh" content="0; url=\/rss\.xml">/);
    assert.match(feedRedirect, /<a href="\/rss\.xml">/);
    const notFound = context.site.read("404.html");
    assert.match(notFound, /Page not found\./);
    assert.match(notFound, /<a href="\/">Back home<\/a>/);
  });

  it("copies static assets", () => {
    assert.ok(context.site.exists("logo.webp"));
    assert.ok(context.site.exists("styles.css"));
    assert.ok(context.site.exists("images"));
  });

  it("ships no JavaScript", () => {
    const files = context.site.listFiles();
    assert.deepEqual(files.filter((file) => file.endsWith(".js")), []);
    for (const file of files.filter((name) => name.endsWith(".html"))) {
      assert.doesNotMatch(context.site.read(file), /<script/i, file);
    }
  });
});

describe("site URL with XML special characters", () => {
  const context = useBuild({
    siteUrl: "https://example.com/a&b",
    posts: { "2024-01-02-hello.md": post({ title: "Hello", date: "2024-01-02" }) },
  });

  it("escapes the URL exactly once in the RSS feed", () => {
    const feed = context.site.read("rss.xml");
    assert.match(feed, /<link>https:\/\/example\.com\/a&amp;b<\/link>/);
    assert.match(feed, /<link>https:\/\/example\.com\/a&amp;b\/posts\/2024-01-02-hello<\/link>/);
    assert.doesNotMatch(feed, /&amp;amp;/);
  });

  it("escapes the URL exactly once in the sitemap", () => {
    const sitemap = context.site.read("sitemap.xml");
    assert.match(sitemap, /<loc>https:\/\/example\.com\/a&amp;b<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/example\.com\/a&amp;b\/posts\/2024-01-02-hello<\/loc>/);
    assert.doesNotMatch(sitemap, /&amp;amp;/);
  });
});

describe("site with ten posts", () => {
  const context = useBuild({ posts: numberedPosts(10) });

  it("fits on one page without pagination", () => {
    const home = context.site.read("index.html");
    assert.equal(countMatches(home, /class="postLink"/g), 10);
    assert.doesNotMatch(home, /Pagination Navigation/);
    assert.equal(context.site.exists("page/2/index.html"), false);
  });
});

describe("site with eleven posts", () => {
  const context = useBuild({ posts: numberedPosts(11) });

  it("shows the newest ten posts on the first page with a next link", () => {
    const home = context.site.read("index.html");
    assert.equal(countMatches(home, /class="postLink"/g), 10);
    assert.ok(home.indexOf("Post 11") < home.indexOf("Post 10"));
    assert.doesNotMatch(home, /Post 01</);
    assert.match(home, /<nav class="pagination" aria-label="Pagination Navigation">/);
    assert.match(home, /<span class="paginationLink paginationCurrent" aria-current="page">1<\/span>/);
    assert.match(home, /<a href="\/page\/2\/" class="paginationLink">2<\/a>/);
    assert.match(home, /<a href="\/page\/2\/" class="paginationLink paginationNext">Next →<\/a>/);
    assert.doesNotMatch(home, /Previous/);
  });

  it("shows the oldest post on the second page with a previous link", () => {
    const secondPage = context.site.read("page/2/index.html");
    assert.equal(countMatches(secondPage, /class="postLink"/g), 1);
    assert.match(secondPage, /Post 01</);
    assert.match(secondPage, /<a href="\/" class="paginationLink paginationPrev">← Previous<\/a>/);
    assert.match(secondPage, /<a href="\/" class="paginationLink">1<\/a>/);
    assert.match(secondPage, /aria-current="page">2<\/span>/);
    assert.doesNotMatch(secondPage, /Next →/);
  });
});

describe("posts without a title or date", () => {
  const context = useBuild({
    posts: {
      "2024-01-02-valid.md": post({ title: "Valid", date: "2024-01-02" }),
      "untitled.md": post({ date: "2024-01-03" }),
      "undated.md": post({ title: "Undated" }),
      "plain.md": "No front matter at all.\n",
    },
  });

  it("are neither rendered nor listed", () => {
    for (const slug of ["untitled", "undated", "plain"]) {
      assert.equal(context.site.exists(`posts/${slug}/index.html`), false, slug);
    }
    const home = context.site.read("index.html");
    assert.equal(countMatches(home, /class="postLink"/g), 1);
    assert.equal(countMatches(context.site.read("rss.xml"), /<item>/g), 1);
    assert.equal(countMatches(context.site.read("sitemap.xml"), /<url>/g), 2);
  });
});

describe("untrusted and unusual content", () => {
  const context = useBuild({
    posts: {
      "2024-01-02-malicious.md": post({
        title: "Malicious",
        date: "2024-01-02",
        body: '<script>alert("xss")</script>\n\n<img src=x onerror=alert(1)>\n\n[link](javascript:alert(1))',
      }),
      "2024-01-03-special.md": post({
        title: 'Tom & "Jerry" <3 ]]> 日本語',
        date: "2024-01-03",
        body: "Text with ]]> inside.",
      }),
      "2024-01-04-crlf.md":
        '---\r\ntitle: "改行コード"\r\ndate: "2024-01-04"\r\n---\r\n\r\nWindows line endings.\r\n',
    },
  });

  it("renders raw HTML in Markdown as text", () => {
    const page = context.site.read("posts/2024-01-02-malicious/index.html");
    assert.doesNotMatch(page, /<script/i);
    assert.doesNotMatch(page, /<img src=x/);
    assert.doesNotMatch(page, /href="javascript:/);
    assert.match(page, /&lt;script&gt;/);
  });

  it("escapes special characters in HTML, RSS and sitemap", () => {
    const home = context.site.read("index.html");
    assert.match(home, /Tom &amp; &quot;Jerry&quot; &lt;3 \]\]&gt; 日本語/);
    const feed = context.site.read("rss.xml");
    assert.match(
      feed,
      /<title><!\[CDATA\[Tom & "Jerry" <3 \]\]\]\]><!\[CDATA\[> 日本語\]\]><\/title>/,
    );
    assert.match(feed, /Text with \]\]\]\]><!\[CDATA\[> inside\./);
  });

  it("handles CRLF front matter", () => {
    const page = context.site.read("posts/2024-01-04-crlf/index.html");
    assert.match(page, /<title>改行コード - /);
    assert.match(page, /Windows line endings\./);
  });
});

describe("invalid front matter", () => {
  it("fails the build and names the file for invalid YAML", (t) => {
    const site = buildSite({ posts: { "2024-01-02-broken.md": '---\ntitle: "Broken\n---\nx\n' } });
    t.after(() => site.cleanup());
    assert.notEqual(site.exitCode, 0);
    assert.match(site.log, /2024-01-02-broken\.md/);
  });

  it("fails the build and names the file for an invalid date", (t) => {
    const site = buildSite({
      posts: { "2024-01-02-bad-date.md": post({ title: "Bad", date: "2024-13-45" }) },
    });
    t.after(() => site.cleanup());
    assert.notEqual(site.exitCode, 0);
    assert.match(site.log, /2024-01-02-bad-date\.md/);
  });
});

describe("repository posts", () => {
  const context = useBuild({ useRepositoryPosts: true });

  it("renders every post with a title and date across five pages", () => {
    const postPages = context.site
      .listFiles()
      .filter((file) => /^posts\/[^/]+\/index\.html$/.test(file));
    assert.equal(postPages.length, 41);
    assert.ok(context.site.exists("page/5/index.html"));
    assert.equal(context.site.exists("page/6/index.html"), false);
    assert.equal(countMatches(context.site.read("rss.xml"), /<item>/g), 41);
  });

  it("uses front matter dates over file name dates", () => {
    const sitemap = context.site.read("sitemap.xml");
    assert.match(
      sitemap,
      /2023-02-14-software-engineering-at-google-chapter3-knowledge-sharing<\/loc>\s*<lastmod>2023-02-13<\/lastmod>/,
    );
  });
});

describe("package manifest", () => {
  it("depends only on Eleventy", () => {
    const manifest = JSON.parse(readFileSync(path.join(repositoryRoot, "package.json"), "utf8"));
    assert.equal(manifest.dependencies, undefined);
    assert.deepEqual(Object.keys(manifest.devDependencies), ["@11ty/eleventy"]);
  });
});
