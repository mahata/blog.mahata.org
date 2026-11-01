import {
  escapeXml,
  formatDisplayDate,
  formatIsoDate,
  formatRfc822Date,
  isPublishablePost,
  pageHref,
  sortNewestFirst,
  wrapCdata,
} from "./lib/posts.js";

export default function (eleventyConfig) {
  for (const ignoredPath of ["README.md", "tests/**", "scripts/**", ".github/**", ".devcontainer/**"]) {
    eleventyConfig.ignores.add(ignoredPath);
  }

  eleventyConfig.amendLibrary("md", (markdownIt) => markdownIt.set({ html: false }));

  eleventyConfig.addPassthroughCopy({ public: "/", "src/styles.css": "styles.css" });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    sortNewestFirst(
      collectionApi.getFilteredByGlob("posts/*.md").filter((item) => isPublishablePost(item.data)),
    ),
  );

  eleventyConfig.addFilter("displayDate", formatDisplayDate);
  eleventyConfig.addFilter("isoDate", formatIsoDate);
  eleventyConfig.addFilter("rfc822Date", formatRfc822Date);
  eleventyConfig.addFilter("xml", escapeXml);
  eleventyConfig.addFilter("cdata", wrapCdata);
  eleventyConfig.addFilter("pageHref", pageHref);

  return {
    dir: { input: ".", includes: "src/_includes", data: "src/_data", output: "dist" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
  };
}
