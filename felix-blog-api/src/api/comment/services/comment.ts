/**
 * comment service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService("api::comment.comment", {
  async findPostCommentTotal(postDocumentId: string) {
    const total = await strapi.documents("api::comment.comment").count({
      filters: {
        post: {
          documentId: postDocumentId,
        },
      },
    });
    return total;
  },
});
