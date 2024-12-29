/**
 * notification service
 */

import { factories } from "@strapi/strapi";
const { sanitize, validate } = strapi.contentAPI;

const modelId = "api::notification.notification";

export default factories.createCoreService(modelId, {
  async unreadCount(ctx) {
    const { auth, user } = ctx.state;
    const schema = strapi.getModel(modelId);
    await validate.query(ctx.query, schema, { auth });
    
    return await strapi.documents(modelId).count({
      filters: {
        user: user.id,
        state: "unread",
      },
    });
  },
});
