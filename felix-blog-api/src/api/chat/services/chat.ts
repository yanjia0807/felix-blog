/**
 * chat service
 */

import { factories } from "@strapi/strapi";
import _ from "lodash";
const { sanitize, validate } = strapi.contentAPI;

const modelId = "api::chat.chat";
export default factories.createCoreService(modelId, ({ strapi }) => ({
  async init(ctx) {
    const schema = strapi.contentType(modelId);
    const { auth, user } = ctx.state;
    await validate.query(ctx.query, schema, { auth });

    const params = _.pick(ctx.request.body, ["users"]);
    console.log("@@", ctx.request.body)
    const data: any = await strapi.documents(modelId).create({
      data: {
        ...params,
        initiator: user.id,
      },
    });

    await Promise.all([
      strapi.documents("api::chat-status.chat-status").create({
        data: {
          chat: data.id,
          user: {
            documentId: params.users[0]
          }
        },
      }),
      strapi.documents("api::chat-status.chat-status").create({
        data: {
          chat: data.id,
          user: {
            documentId: params.users[1]
          }
        },
      }),
    ]);

    return {
      data,
    };
  },
}));
