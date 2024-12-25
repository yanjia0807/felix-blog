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
                fields: ['alternativeText', 'width', 'height', 'formats'],
              },
            },
            fields: ["username", "bio", "gender", "birthday"],
          },
          following: {
            fields: [],
          }
        },
      });

      const data = {
        type: "follow" as any,
        message: `${result.follower.username} 关注了你`,
        user: result.following.id,
        metaData: {
          documentId: event.result.documentId,
          follower: result.follower,
        },
      }


      await strapi.documents("api::notification.notification").create({
        data: {
          ...data,
          metaData: JSON.stringify(data.metaData),
        }
      });

      io.to(result.following.id).emit("notification:create", {data});
    } catch (error) {
      strapi.log.error(error);
    }
  },
};
