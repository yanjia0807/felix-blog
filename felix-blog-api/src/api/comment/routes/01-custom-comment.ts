export default {
  routes: [
    {
      method: "GET",
      path: "/comments/total",
      handler: "api::comment.comment.findPostCommentTotal",
    },
  ],
};
