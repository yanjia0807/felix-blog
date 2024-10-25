import { View,  } from "react-native";
import React from "react";
import { Link, router } from 'expo-router';
import { Fab, FabLabel, FabIcon } from "@/components/ui/fab";
import { AddIcon, ArrowRightIcon, Icon } from "@/components/ui/icon";
import { FlashList } from "@shopify/flash-list";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {Image} from '@/components/ui/image';
import {Text} from '@/components/ui/text';

const data = [
  {
    title: "生活中的小确幸",
    publishDate: "2024-10-01",
    description: "分享生活中那些微小但让人开心的瞬间。",
    cover: "https://picsum.photos/seed/life1/800/400",
    content: "生活中有很多小确幸，今天我想和大家分享我最近发现的一些...",
  },
  {
    title: "周末的城市探险",
    publishDate: "2024-10-05",
    description: "在城市中探索新的地方和体验。",
    cover: "https://picsum.photos/seed/life2/800/400",
    content:
      "周末我决定去探索我从未去过的城市角落，结果发现了很多有趣的地方...",
  },
  {
    title: "家庭聚会的温暖",
    publishDate: "2024-10-10",
    description: "回顾一次难忘的家庭聚会。",
    cover: "https://picsum.photos/seed/life3/800/400",
    content:
      "家庭聚会总是让人感到温暖，这次聚会我们一起分享了许多美好的回忆...",
  },
  {
    title: "与自然的亲密接触",
    publishDate: "2024-10-15",
    description: "在大自然中放松身心的重要性。",
    cover: "https://picsum.photos/seed/life4/800/400",
    content: "亲近自然是一种很好的放松方式，最近我去了一个美丽的国家公园...",
  },
  {
    title: "健康生活的秘诀",
    publishDate: "2024-10-20",
    description: "分享健康生活的小窍门。",
    cover: "https://picsum.photos/seed/life5/800/400",
    content: "保持健康的生活方式并不难，今天我想分享一些我自己的小秘诀...",
  },
];

const BlogList = () => {
  const renderItem = ({item}: any) => {
    return (
      <Card className="p-5 rounded-lg m-3">
        <Image
          source={{
            uri: item.cover,
          }}
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
  }
  
  return (
    <>
      <FlashList
        data={data}
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
        <FabLabel>发布</FabLabel>
      </Fab>
    </>
  );
};

export default BlogList;
