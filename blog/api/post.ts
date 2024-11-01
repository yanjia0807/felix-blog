import axios from "axios";
import qs from "qs";
import { baseURL } from "./config";
import { useQuery } from "@tanstack/react-query";

export const fetchPosts = async () => {
  const query = qs.stringify({
    populate: {
      tags: {
        fields: ["name", "slug"],
      },
      author: {
        populate: {
          avatar: {
            fields: ["formats", "name", "alternativeText"],
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
  });
  const res = await axios.get(`${baseURL}/api/posts?${query}`);
  console.log(res);
  return res.data.data;
};

export const useFetchPosts = () => {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
};
