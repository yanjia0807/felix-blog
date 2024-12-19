/**
 * post service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::post.post", {
  async findAdditional(ctx: any) {
    const userDocumentId = ctx.state?.user?.documentId;
    const { populate, filters, pagination, ...rest } = ctx.query;
    const { limit = 10, start = 0 } = pagination;

    const results = await strapi.documents("api::post.post").findMany({
      start,
      limit,
      populate: {
        likedByUsers: {
          fields: ["documentId"],
        },
        ...populate,
      },
      ...filters,
      ...rest,
    });

    const total = await strapi.documents("api::post.post").count({ filters });

    if (!userDocumentId) {
      return {
        data: results,
        meta: {
          pagination: {
            total,
            start,
            limit,
          },
        },
      };
    }

    const likedPosts = await strapi.db.query("api::post.post").findMany({
      where: { likedByUsers: { documentId: userDocumentId } },
      select: ["documentId"],
    });

    const modifiedPosts = results.map((post) => ({
      ...post,
      likedByMe: likedPosts
        .map((post) => post.documentId)
        .includes(post.documentId),
    }));

    return {
      data: modifiedPosts,
      meta: {
        pagination: {
          total,
          start,
          limit,
        },
      },
    };
  },

  async findOneAdditional(ctx: any) {
    const userDocumentId = ctx.state?.user?.documentId;
    const { documentId } = ctx.params;
    const { populate } = ctx.query;

    const result: any = await strapi.documents("api::post.post").findOne({
      documentId,
      populate: {
        likedByUsers: {
          fields: ["documentId"],
        },
        ...populate,
      },
    });

    if (!userDocumentId) {
      return {
        data: result,
        meta: {},
      };
    }

    const modifiedPosts = {
      ...result,
      likedByMe: result.likedByUsers
        .map((item) => item.documentId)
        .includes(userDocumentId),
    };

    return {
      data: modifiedPosts,
      meta: {},
    };
  }
});
