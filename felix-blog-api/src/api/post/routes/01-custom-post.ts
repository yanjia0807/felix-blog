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
    {
      method: "GET",
      path: "/posts/recent-authors",
      handler: "api::post.post.findRecentAuthors",
    },
    {
      method: "GET",
      path: "/posts/photos",
      handler: "api::post.post.findPhotos",
    },
  ],
};
