/**
 * comment controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController(
  "api::comment.comment",
  ({ strapi }) => ({
    async findPostCommentTotal(ctx) {
      const { postDocumentId } = ctx.query;

      const total = await strapi
        .service("api::comment.comment")
        .findPostCommentTotal(postDocumentId);
      return {
        data: { total },
      };
    },
  })
);
