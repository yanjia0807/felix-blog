/**
 * comment controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::comment.comment",
  ({ strapi }) => ({
    async count(ctx) {
      return await strapi.service("api::comment.comment").count(ctx);
    },
  })
);