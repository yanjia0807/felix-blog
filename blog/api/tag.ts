import { flattenAttributes } from "./utils";
import client from "./client";

export async function fetchTags({ locale }: any) {
  const url = "/api/tags";
  const params = {
    locale,
  };
  const res = await client.get(url, { params });
  const result = flattenAttributes(res.data);
  return result;
}
