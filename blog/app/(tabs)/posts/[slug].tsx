import { View } from "react-native";
import React, { useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { fetchPostBySlug } from "~/api/post";
import Markdown from "react-native-markdown-display";
import { H4, P, Small, Muted } from "~/components/ui/typography";
import { Text } from "~/components/ui/text";
import moment from "moment";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { queryStrapiMedia } from "~/api/utils";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "~/components/ui/button";
import { CustomBottomSheet } from "~/components/custom-bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import { KeyboardDismissPressable } from "~/components/keyboard-dismiss-pressable";
import { useQuery } from "@tanstack/react-query";

const PostDetail = () => {
  const { slug } = useLocalSearchParams();

  const {
    data: post,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["posts", slug],
    queryFn: () => fetchPostBySlug({ slug }),
  });

  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleClosePress = () => bottomSheetRef.current?.close();
  const handleOpenPress = () => bottomSheetRef.current?.expand();

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

  const source = post.blocks?.find(
    (block: any) => block["__component"] === "shared.rich-text"
  )?.body;
  const author = post.authors.data[0];
  const avatar = queryStrapiMedia(author.avatar.url);
  const tags = post.tags.data;

  return (
    <KeyboardDismissPressable>
      <ScrollView className="flex-1 p-4">
        <H4 className="self-center">{post.title}</H4>
        <Small className="self-center">
          {moment(post.publishedAt).format("LLLL")}
        </Small>
        <View className="flex-1 flex-row justify-center">
          {tags.map((tag: any) => (
            <Muted key={tag.slug} className="p-2">
              {tag.name}
            </Muted>
          ))}
        </View>
        <View className="flex-row gap-1 justify-center items-center">
          <Avatar alt={author.name}>
            <AvatarImage source={{ uri: avatar }} />
          </Avatar>
          <Small>{author.name}</Small>
        </View>
        <View className="flex-1">
          <Markdown>{source}</Markdown>
        </View>
        <View>
          <Button variant="secondary" size="sm" onPress={handleOpenPress}>
            <Text>添加评论</Text>
          </Button>
        </View>
      </ScrollView>
      <CustomBottomSheet ref={bottomSheetRef}></CustomBottomSheet>
    </KeyboardDismissPressable>
  );
};

export default PostDetail;
