/**
 * chat service
 */

import { factories } from "@strapi/strapi";

const modelId = "api::chat.chat";
export default factories.createCoreService(modelId, ({ strapi }) => ({
  async init(ctx, params: any) {
    const chat = await strapi.documents(modelId).create({
      data: {
        ...ctx.request.body.data,
        initiator: ctx.state.user.id,
      },
      populate: {
        users: true,
        initiator: true,
      },
    });

    await Promise.all([
      strapi.documents("api::chat-status.chat-status").create({
        data: {
          chat: chat.id,
          user: chat.users[0].id,
        },
      }),
      strapi.documents("api::chat-status.chat-status").create({
        data: {
          chat: chat.id,
          user: chat.users[1].id,
        },
      }),
    ]);

    return chat;
  },
}));
