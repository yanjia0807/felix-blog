/**
 * post service
 */

import { factories } from "@strapi/strapi";
const { sanitize, validate } = strapi.contentAPI;

const modelId = "api::post.post";

export default factories.createCoreService(modelId, {
  async findAdditional(ctx: any) {
    const userDocumentId = ctx.state?.user?.documentId;
    const { populate, filters, pagination, ...rest } = ctx.query;
    const { limit = 10, start = 0 } = pagination;
    console.log("@@", filters)
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
        filters,
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

  async findRecentAuthors(ctx: any) {
    const schema = strapi.contentType(modelId);
    const { auth } = ctx.state;
    await validate.query(ctx.query, schema, { auth });

    let data = await strapi.db.connection.raw(
      `SELECT t1.id,t1.document_id AS 'documentId',t1.username,t2.formats FROM (
        SELECT*FROM (
        SELECT t3.id,t3.document_id,t3.username FROM posts t1 INNER JOIN posts_author_lnk t2 ON t1.id=t2.post_id INNER JOIN up_users t3 ON t2.user_id=t3.id ORDER BY t1.created_at DESC) t1 GROUP BY t1.id,t1.document_id,t1.username) t1 LEFT JOIN (
        SELECT t1.related_id,t2.formats FROM files_related_mph t1 INNER JOIN files t2 ON t1.file_id=t2.id WHERE t1.related_type='plugin::users-permissions.user') t2 ON t1.id=t2.related_id LIMIT 0, 20`
    );

    return {
      data: data && data[0] || []
    };
  },
});
