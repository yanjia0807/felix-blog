/**
 * post service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService("api::post.post", {
  async findAdditional(userDocumentId: number, query: any) {
    const {
      limit = 10,
      start = 0,
      populate,
      filters,
      ...rest
    } = query.pagination;

    const posts = await strapi.documents("api::post.post").findMany({
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
        data: posts,
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
    const modifiedPosts = posts.map((post) => ({
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

  async findOneAdditional(userDocumentId: string, params: any, query: any) {
    const { documentId } = params;
    const { populate } = query;

    const post: any = await strapi.documents("api::post.post").findOne({
      documentId,
      populate: {
        likedByUsers: {
          fields: ["documentId"],
        },
        ...populate,
      },
    });

    console.log(post);

    if (!userDocumentId) {
      return {
        data: post,
        meta: {},
      };
    }

    const modifiedPosts = {
      ...post,
      likedByMe: post.likedByUsers
        .map((item) => item.documentId)
        .includes(userDocumentId),
    };

    return {
      data: modifiedPosts,
      meta: {},
    };
  },
});
