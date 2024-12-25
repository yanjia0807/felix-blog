/**
 * notification controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::notification.notification",
  ({ strapi }) => ({
    async count(ctx) {
      return await strapi.service("api::notification.notification").count(ctx);
    },
  })
);
