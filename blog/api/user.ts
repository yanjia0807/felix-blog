import { client } from "./config";
import qs from "qs";

export const fetchMe = async () => {
  const res = await client.get(`/users/me`);
  const user = res.data;
  const query = qs.stringify(
    {
      populate: {
        avatar: {
          fields: ["formats", "name", "alternativeText"],
        },
      },
      filters: {
        user: {
          id: {
            $eq: user.id,
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    }
  );
  const res1 = await client.get(`/profiles?${query}`);

  const profile = res1.data?.data[0];
  const result = {
    ...user,
    profile,
  };
  return result;
};
