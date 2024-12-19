export default {
  routes: [
    {
      method: "GET",
      path: "/posts/additional",
      handler: "api::post.post.findAdditional",
    },
    {
      method: "GET",
      path: "/posts/:documentId/additional",
      handler: "api::post.post.findOneAdditional",
    },
  ],
};
