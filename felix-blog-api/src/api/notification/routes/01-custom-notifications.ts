export default {
  routes: [
    {
      method: "GET",
      path: "/notifications/count",
      handler: "api::notification.notification.count",
    }
  ],
};
