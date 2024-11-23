/**
 * post controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  "api::post.post",
  ({ strapi }) => ({
    async findAdditional(ctx) {
      const userDocumentId = ctx.state?.user?.documentId;
      const query = ctx.query;

      const posts = await strapi
        .service("api::post.post")
        .findAdditional(userDocumentId, query);
      return posts;
    },

    async findOneAdditional(ctx) {
      const userDocumentId = ctx.state?.user?.documentId;
      const query = ctx.query;
      const params = ctx.params;

      const posts = await strapi
        .service("api::post.post")
        .findOneAdditional(userDocumentId, params, query);
      return posts;
    },
  })
);
