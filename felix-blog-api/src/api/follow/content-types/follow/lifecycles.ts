import type { Core } from "@strapi/strapi";

export default {
  async afterCreate(event: any) {
    const strapi = global.strapi as Core.Strapi;
    const io = (strapi as any).io;

    try {
      const result = await strapi.documents("api::follow.follow").findOne({
        documentId: event.result.documentId,
        populate: {
          follower: {
            populate: {
              avatar: {
                fields: ["alternativeText", "width", "height", "formats"],
              },
            },
            fields: ["username", "bio", "gender", "birthday"],
          },
          following: {
            fields: [],
          },
        },
      });

      const data = {
        type: "follow" as any,
        message: `${result.follower.username} 关注了你`,
        user: result.following.id,
        metaData: JSON.stringify({
          documentId: event.result.documentId,
          follower: result.follower,
        }),
      };

      const notification = await strapi
        .documents("api::notification.notification")
        .create({
          data,
        });

      io.to(result.following.id).emit("notification:create", {
        data: notification,
      });
    } catch (error) {
      strapi.log.error(error);
    }
  },
};
