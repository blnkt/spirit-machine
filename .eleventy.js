const { DateTime } = require("luxon");
const CleanCSS = require("clean-css");
const { minify: minifyJs } = require("terser");
const htmlmin = require("html-minifier-next");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function(eleventyConfig) {

  // Eleventy Navigation https://www.11ty.dev/docs/plugins/navigation/
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Configuration API: use eleventyConfig.addLayoutAlias(from, to) to add
  // layout aliases! Say you have a bunch of existing content using
  // layout: post. If you don’t want to rewrite all of those values, just map
  // post to a new file like this:
  // eleventyConfig.addLayoutAlias("post", "layouts/my_new_post_layout.njk");

  // Merge data instead of overriding
  // https://www.11ty.dev/docs/data-deep-merge/
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addCollection("event", collection => {
    return collection
      .getFilteredByGlob("events/*.md")
      .sort((a, b) => a.data.startDate - b.data.startDate);
  });

  eleventyConfig.addCollection("music", collection => {
    return collection.getFilteredByGlob("music/*.md").sort((a, b) => {
      const orderA = a.data.order ?? 0;
      const orderB = b.data.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (b.data.year ?? 0) - (a.data.year ?? 0);
    });
  });

  eleventyConfig.addCollection("featuredEvent", collection => {
    return collection
      .getFilteredByGlob("events/*.md")
      .filter(item => item.data.featured);
  });

  eleventyConfig.addCollection("featuredRelease", collection => {
    return collection
      .getFilteredByGlob("music/*.md")
      .filter(item => item.data.featured);
  });

  eleventyConfig.addCollection("upcomingEvents", collection => {
    const now = DateTime.now();
    return collection
      .getFilteredByGlob("events/*.md")
      .filter(item => DateTime.fromJSDate(item.data.startDate) > now)
      .sort((a, b) => a.data.startDate - b.data.startDate);
  });

  eleventyConfig.addCollection("pastEvents", collection => {
    const now = DateTime.now();
    return collection
      .getFilteredByGlob("events/*.md")
      .filter(item => DateTime.fromJSDate(item.data.startDate) <= now)
      .sort((a, b) => b.data.startDate - a.data.startDate);
  });

  // Date formatting (human readable)
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("dd LLL yyyy");
  });

  // Date formatting (machine readable)
  eleventyConfig.addFilter("machineDate", dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat("yyyy-MM-dd");
  });

  eleventyConfig.addFilter("eventDateRange", (startDate, endDate) => {
    if (!startDate) return "";
    const start = DateTime.fromJSDate(startDate);
    if (!endDate) return start.toFormat("MMMM d, yyyy");
    const end = DateTime.fromJSDate(endDate);
    if (start.hasSame(end, "day")) return start.toFormat("MMMM d, yyyy");
    if (start.hasSame(end, "month") && start.hasSame(end, "year")) {
      const days = [];
      let cur = start;
      while (cur <= end) {
        days.push(cur.day);
        cur = cur.plus({ days: 1 });
      }
      const dayStr =
        days.length > 2
          ? `${days.slice(0, -1).join(", ")}, ${days[days.length - 1]}`
          : days.join(", ");
      return `${start.toFormat("MMMM")} ${dayStr}, ${start.year}`;
    }
    return `${start.toFormat("MMMM d")} – ${end.toFormat("MMMM d, yyyy")}`;
  });

  eleventyConfig.addFilter("isFuture", dateObj => {
    if (!dateObj) return false;
    return DateTime.fromJSDate(dateObj) > DateTime.now();
  });

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Minify JS
  eleventyConfig.addFilter("jsmin", async function(code) {
    try {
      const result = await minifyJs(code);
      return result.code ?? code;
    } catch (err) {
      console.log("Terser error: ", err);
      return code;
    }
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (typeof outputPath === "string" && outputPath.indexOf(".html") > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });

  // Don't process folders with static assets e.g. images
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("static/img");
  eleventyConfig.addPassthroughCopy("admin/");
  // We additionally output a copy of our CSS for use in Decap CMS previews
  eleventyConfig.addPassthroughCopy("_includes/assets/css/inline.css");

  /* Markdown Plugins */
  let markdownIt = require("markdown-it");
  let markdownItAnchor = require("markdown-it-anchor");
  let options = {
    breaks: true,
    linkify: true
  };
  let opts = {
    permalink: false
  };

  eleventyConfig.setLibrary("md", markdownIt(options)
    .use(markdownItAnchor, opts)
  );

  return {
    templateFormats: ["md", "njk", "liquid"],

    // If your site lives in a different subdirectory, change this.
    // Leading or trailing slashes are all normalized away, so don’t worry about it.
    // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
    // This is only used for URLs (it does not affect your file structure)
    pathPrefix: "/",

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
