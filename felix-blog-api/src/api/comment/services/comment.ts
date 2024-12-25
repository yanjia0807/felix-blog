/**
 * comment service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::comment.comment", {
  async count(ctx: any) {
    return await strapi.documents("api::comment.comment").count({
      filters: {
        post: {
          documentId: ctx.query.postDocumentId,
        },
      },
    });
  },
});
