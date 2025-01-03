/**
 * post controller
 */

import { factories } from "@strapi/strapi";

const modelId = "api::post.post";

export default factories.createCoreController(modelId, ({ strapi }) => ({
  async findAdditional(ctx) {
    return await strapi.service(modelId).findAdditional(ctx);
  },

  async findOneAdditional(ctx) {
    return await strapi.service(modelId).findOneAdditional(ctx);
  },
}));
