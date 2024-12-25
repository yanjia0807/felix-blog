const { sanitize, validate } = strapi.contentAPI;

const modelId = "plugin::users-permissions.user";

module.exports = (plugin) => {
  plugin.controllers.user.find = async (ctx) => {
    const schema = strapi.getModel(modelId);
    const { auth } = ctx.state;
    await validate.query(ctx.query, schema, { auth });

    let sanitizedQueryParams = await sanitize.query(ctx.query, schema, {
      auth,
    });
    sanitizedQueryParams = {
      ...sanitizedQueryParams,
      ...(sanitizedQueryParams.pagination as Record<string, unknown>),
    };
    const { results, pagination } = await strapi.entityService.findPage(
      modelId,
      sanitizedQueryParams
    );
    const users = await Promise.all(
      results.map((user) => sanitize.output(user, schema, { auth }))
    );
    ctx.body = {
      data: users,
      meta: {
        pagination: pagination,
      },
    };
  };

  plugin.controllers.user.findOne = async (ctx) => {
    const schema = strapi.contentType(modelId);
    const { auth } = ctx.state;
    const { id: documentId } = ctx.params;
    await validate.query(ctx.query, schema, { auth });
    const sanitizedQueryParams = await sanitize.query(ctx.query, schema, {
      auth,
    });

    const userData = await strapi.documents(schema.uid).findOne({
      documentId,
      ...sanitizedQueryParams,
    });

    const sanitizeUserData: any = await sanitize.output(userData, schema, {
      auth,
    });

    const result = {
      ...sanitizeUserData,
    };

    return result;
  };

  return plugin;
};
