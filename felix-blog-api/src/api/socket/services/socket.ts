import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  initialize() {
    strapi.eventHub.on("socket.ready", async () => {
      const io = (strapi as any).io;
      if (!io) {
        strapi.log.error("Socket.IO is not initialized");
        return;
      }

      io.use(async (socket, next) => {
        const { token } = socket.handshake.auth;

        try {
          const jwtService = strapi.service("plugin::users-permissions.jwt");
          const payload = await jwtService.verify(token);
          socket.userId = payload.id;
        } catch (error) {
          return next(new Error("invalid token"));
        }
        next();
      });

      io.on("connection", async (socket: any) => {
        strapi.log.info(
          `New client connected with id ${socket.id}, userId: ${socket.userId}`
        );
        const notificationSchemaId = "api::notification.notification";

        socket.emit("session", {
          userId: socket.userId,
        });

        socket.join(socket.userId);

        const unreadCount = await strapi.documents(notificationSchemaId).count({
          filters: {
            user: socket.userId,
            state: "unread",
          },
        });

        socket.on(
          "notification:fetch",
          async ({ pagination: { page, pageSize } }) => {
            const start = (page - 1) * pageSize;
            const limit = pageSize;

            const [data, total]: any = await Promise.all([
              strapi.documents(notificationSchemaId).findMany({
                filters: {
                  user: socket.userId,
                },
                sort: ["state:asc", "createdAt:desc"],
                limit,
                start,
              }),
              strapi.documents(notificationSchemaId).count({
                filters: {
                  user: socket.userId,
                },
              }),
            ]);

            const result = {
              data,
              meta: {
                pagination: {
                  page: Number(page),
                  pageSize: Number(pageSize),
                  pageCount: Math.ceil(total / pageSize),
                  total: total,
                },
              },
            }

            socket.emit("notification:list", result);
          }
        );

        socket.emit("notification:count", {
          unread: unreadCount,
        });

        socket.on("disconnect", () => {
          strapi.log.info(`Client disconnected with id ${socket.id}`);
        });
      });

      strapi.log.info("Socket service initialized successfully");
    });
  },
});
