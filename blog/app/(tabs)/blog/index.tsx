import React from "react";
import { router } from "expo-router";
import { Fab, FabLabel, FabIcon } from "@/components/ui/fab";
import { AddIcon, ArrowRightIcon, Icon } from "@/components/ui/icon";
import { FlashList } from "@shopify/flash-list";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { baseURL, useFetchPosts } from "@/api";

const BlogList = () => {
  const { data: posts, error, isLoading } = useFetchPosts();

  const renderItem = ({ item }: any) => {
    console.log(item);
    return (
      <Card className="p-5 rounded-lg m-3">
        <Image
          source={{
            uri: `${baseURL}${item.cover.formats.medium.url}`,
          }}
          alt={item.cover.name}
          width={item.cover.formats.medium.width}
          height={item.cover.formats.medium.height}
          className="mb-6 h-[240px] w-full rounded-md"
        />
        <Text className="text-sm font-normal mb-2 text-typography-700">
          {item.publishDate}
        </Text>
        <Heading size="md" className="mb-4">
          {item.title}
        </Heading>
        <Text numberOfLines={3}>{item.content}</Text>
        <HStack className="items-center">
          <Text size="sm" className="font-semibold text-info-600 no-underline">
            更多
          </Text>
          <Icon
            as={ArrowRightIcon}
            size="sm"
            className="text-info-600 mt-0.5 ml-0.5"
          />
        </HStack>
      </Card>
    );
  };

  if (isLoading) return <Text>Fetching posts...</Text>;

  if (error) return <Text>An error occurred: {error.message}</Text>;

  return (
    <>
      <FlashList
        data={posts}
        renderItem={({ item }) => renderItem({ item })}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
      <Fab
        size="md"
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
        onPress={() => {
          router.push("./blog/create");
        }}
      >
        <FabIcon as={AddIcon} />
        <FabLabel>记录</FabLabel>
      </Fab>
    </>
  );
};

export default BlogList;
