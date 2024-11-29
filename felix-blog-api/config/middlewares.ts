export default [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  {
    name: "strapi::body",
    config: {
      formLimit: "100mb",
      jsonLimit: "100mb",
      textLimit: "100mb",
      formidable: {
        maxFileSize: 100 * 1024 * 1024,
      },
    },
  },
];
