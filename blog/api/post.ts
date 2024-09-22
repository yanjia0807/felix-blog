import { flattenAttributes } from "./utils";
import client from "./client";

export async function fetchPostBySlug({ slug }: any) {
  const url = "/api/posts";
  const params = {
    filters: { slug },
    populate: {
      authors: {
        populate: {
          avatar: true,
          blocks: true,
        },
      },
      cover: true,
      blocks: true,
      tags: true,
      localizations: {
        fields: ["locale", "slug"],
      },
    },
    locale: "all",
  };

  const res = await client.get(url, { params });
  const result = flattenAttributes(res.data);
  return result.data[0];
}

export async function fetchPosts({ pageParam }: any) {
  const { locale, pagination } = pageParam;
  const url = "/api/posts";
  const params = {
    sort: ["publishedAt:desc"],
    pagination,
    populate: {
      authors: {
        fields: ["name"],
      },
      tags: {
        populate: true,
      },
      cover: {
        populate: true,
      },
    },
    locale,
  };

  const res = await client.get(url, { params });
  const result = flattenAttributes(res.data);
  return result;
}
