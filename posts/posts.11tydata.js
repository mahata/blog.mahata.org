import { isPublishablePost, slugFromInputPath } from "../lib/posts.js";

export default {
  layout: "post.njk",
  eleventyComputed: {
    slug: (data) => slugFromInputPath(data.page.inputPath),
    permalink: (data) =>
      isPublishablePost(data) ? `/posts/${slugFromInputPath(data.page.inputPath)}/` : false,
  },
};
