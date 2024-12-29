/**
 * chat controller
 */

import { factories } from "@strapi/strapi";

const modelId = "api::chat.chat";
export default factories.createCoreController(modelId, ({ strapi }) => ({
  async init(ctx) {
    await this.validateQuery(ctx); 
    const sanitizedQueryParams = await this.sanitizeQuery(ctx);
    return await strapi.service(modelId).init(ctx, sanitizedQueryParams);
  },
}));
