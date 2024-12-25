export default {
  routes: [
    {
      method: "GET",
      path: "/comments/count",
      handler: "api::comment.comment.count",
    },
  ],
};
