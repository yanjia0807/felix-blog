/**
 * post service
 */

import { factories } from "@strapi/strapi";

const modelId = "api::post.post";

export default factories.createCoreService(modelId, {
  async findAdditional(ctx: any) {
    const userDocumentId = ctx.state?.user?.documentId;
    const { populate, filters, pagination, ...rest } = ctx.query;
    const { limit = 10, start = 0 } = pagination;

    const [data, total]: any = await Promise.all([
      strapi.documents(modelId).findMany({
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
      }),
      strapi.documents(modelId).count({ filters }),
    ]);

    if (!userDocumentId) {
      return {
        data,
        meta: {
          pagination: {
            total,
            start,
            limit,
          },
        },
      };
    }

    const likedPosts = await strapi.db.query(modelId).findMany({
      where: { likedByUsers: { documentId: userDocumentId } },
      select: ["documentId"],
    });

    const modifiedPosts = data.map((post) => ({
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

    const data: any = await strapi.documents(modelId).findOne({
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
        data,
        meta: {},
      };
    }

    const modifiedPosts = {
      ...data,
      likedByMe: data.likedByUsers
        .map((item) => item.documentId)
        .includes(userDocumentId),
    };

    return {
      data: modifiedPosts,
      meta: {},
    };
  },
});
