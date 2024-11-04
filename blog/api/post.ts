import axios from "axios";
import qs from "qs";
import { baseURL } from "./config";
import { useQuery } from "@tanstack/react-query";

export const fetchPosts = async () => {
  const query = qs.stringify(
    {
      populate: {
        tags: {
          fields: ["name", "slug"],
        },
        author: {
          populate: {
            profile: {
              populate: {
                avatar: {
                  fields: ["formats", "name", "alternativeText"],
                },
              },
            },
          },
        },
        cover: {
          fields: ["formats", "name", "alternativeText"],
        },
        blocks: {
          on: {
            "shared.attachment": {
              populate: {
                files: {
                  fields: ["formats", "name", "alternativeText"],
                },
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res = await axios.get(`${baseURL}/api/posts?${query}`);
  return res.data.data;
};

export const fetchPostByDocumentId = async ({ queryKey }: any) => {
  const [_key, documentId] = queryKey;

  const query = qs.stringify(
    {
      populate: {
        tags: {
          fields: ["name", "slug"],
        },
        author: {
          populate: {
            profile: {
              populate: ["avatar"],
            },
          },
        },
        cover: {
          fields: ["formats", "name", "alternativeText"],
        },
        blocks: {
          on: {
            "shared.attachment": {
              populate: {
                files: {
                  fields: ["formats", "name", "alternativeText"],
                },
              },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  );
  console.log(`${baseURL}/api/posts/${documentId}?${query}`);
  const res = await axios.get(`${baseURL}/api/posts/${documentId}?${query}`);
  return res.data.data;
};

export const useFetchPost = (documentId: string) => {
  return useQuery({
    queryKey: ["posts", documentId],
    queryFn: fetchPostByDocumentId,
  });
};

export const useFetchPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
};
