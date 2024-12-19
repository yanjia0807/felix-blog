/**
 * post controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async findAdditional(ctx) {
      const posts = await strapi.service("api::post.post").findAdditional(ctx);

      return posts;
    },

    async findOneAdditional(ctx) {
      const posts = await strapi
        .service("api::post.post")
        .findOneAdditional(ctx);

      return posts;
    }
  })
);
