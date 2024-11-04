import { View } from "react-native";
import React from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useFetchPost } from "@/api/post";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import AlertToast from "@/components/alert-toast";
import { useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Box } from "@/components/ui/box";
import { baseURL } from "@/api";
import moment from "moment";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const PostDetail = () => {
  const { documentId } = useLocalSearchParams();
  const toast = useToast();

  const {
    isPending,
    isError,
    isSuccess,
    data: post,
    error,
  } = useFetchPost(documentId as string);

  if (isError) {
    toast.show({
      id: "1",
      duration: 3000,
      placement: "top",
      render: ({ id }) => (
        <AlertToast id={id} description={error.message} action="error" />
      ),
    });
  }

  const renderItem = ({ item }: any) => {
    return (
      <Box className="m-1 w-48 h-48">
        <Image
          source={{
            uri: `${baseURL}/${item.small.url}`,
          }}
          alt={item.alternativeText}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 12,
          }}
        />
      </Box>
    );
  };

  const files = post?.blocks
    ?.find((item: any) => item["__component"] === "shared.attachment")
    ?.files.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      small: item.formats.small,
    }));

  const title = post?.title;
  const content = post?.content;
  const author = post?.author;
  const publishedAt =
    post && moment(post.publishedAt).format("YYYY-MM-DD h:mm:ss");

  console.log(files);

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerShown: true,
          headerLeft: () => (
            <Button
              size="sm"
              variant="link"
              onPress={() => {
                router.dismiss();
              }}
            >
              <ButtonText>返回</ButtonText>
            </Button>
          ),
        }}
      />
      {isPending && (
        <Spinner className="absolute top-0 right-0 bottom-0 left-0 z-50"></Spinner>
      )}
      {isSuccess && (
        <Card className="flex-1 p-4">
          <VStack space="md">
            <Heading size="2xl">{title}</Heading>
            <HStack space="md">
              <Text size="sm"> {publishedAt}</Text>
            </HStack>
            <HStack className="items-center" space="sm">
              <Avatar size="sm">
                <AvatarImage
                  source={{
                    uri: `${baseURL}/${author?.profile?.avatar.formats.thumbnail.url}`,
                  }}
                />
              </Avatar>
              <VStack>
                <Text size="sm" bold={true}>
                  {author?.profile?.nickname}
                </Text>
              </VStack>
            </HStack>
            {files?.length > 0 && (
              <FlashList
                data={files}
                keyExtractor={(item: any) => item.id}
                horizontal={true}
                renderItem={renderItem}
                estimatedItemSize={200}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              />
            )}
            <Text size="sm">{content}</Text>
          </VStack>
        </Card>
      )}
    </>
  );
};

export default PostDetail;
