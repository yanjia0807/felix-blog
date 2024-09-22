import React from "react";
import { Image } from "react-native";

import { queryStrapiMedia } from "~/api/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";

import { FlashList } from "@shopify/flash-list";
import { Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import _ from "lodash";
import { Small } from "~/components/ui/typography";

import { Link } from "expo-router";
import { fetchPosts } from "~/api/post";
import { fetchTags } from "~/api/tag";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const Page = () => {
  const locale = "zh";

  const renderPostItem = React.useCallback(({ item }: any) => {
    const { title, slug, description, createdAt, tags, cover } = item;
    const coverUrl = cover.url && queryStrapiMedia(cover.url);

    return (
      <Link href={`/posts/${slug}`} className="my-4 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{createdAt}</CardDescription>
            <CardDescription>
              {tags.data.map((tag: any) => (
                <Small key={tag.slug}>{tag.name}</Small>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text>{description}</Text>
            <Image source={{ uri: coverUrl }} className="h-44"></Image>
          </CardContent>
          <CardFooter className="justify-end"></CardFooter>
        </Card>
      </Link>
    );
  }, []);

  const renderTagItem = React.useCallback(({ item }: any) => {
    const { name } = item;
    return (
      <Button variant="secondary" className="mx-2">
        <Text>{name}</Text>
      </Button>
    );
  }, []);

  const {
    data: posts,
    error: fetchPostsError,
    isLoading: isFetchPostsLoading,
    isError: isFetchPostsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    initialPageParam: {
      locale,
      pagination: {
        page: 1,
        pageSize: 5,
      },
    },
    getNextPageParam: (lastPage) => {
      const { page, pageSize, pageCount } = lastPage?.meta?.pagination;
      if (page < pageCount) {
        return {
          locale,
          pagination: {
            page: page + 1,
            pageSize,
          },
        };
      }
    },
  });

  const {
    data: tags,
    error: fetchTagsError,
    isError: isFetchTagsError,
    isLoading: isFetchTagsLoading,
  } = useQuery({
    queryKey: ["tags"],
    queryFn: () => fetchTags({ locale }),
  });

  const loadMorePosts = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const isLoading = isFetchPostsLoading || isFetchTagsLoading;
  const isError = isFetchPostsError || isFetchTagsError;

  if (isLoading) {
    return (
      <View>
        <Text> Loading data </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View>
        <Text> Error Loading data </Text>
      </View>
    );
  }

  const postList = _.reduce(
    posts!.pages,
    (data: any, item: any) => [...data, ...item.data],
    []
  );

  const tagList = tags.data;

  return (
    <View className="p-4 flex-1">
      <FlashList
        data={tagList}
        keyExtractor={(item: any) => item.id}
        horizontal={true}
        renderItem={renderTagItem}
        estimatedItemSize={30}
      />
      <FlashList
        data={postList}
        renderItem={renderPostItem}
        keyExtractor={(item: any) => item.id}
        estimatedItemSize={300}
        refreshing={isFetchingNextPage}
        onEndReached={loadMorePosts}
      />
    </View>
  );
};

export default Page;
