import { TouchableOpacity, View } from "react-native";
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
import { BookMarked, BookMarkedIcon, Share2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Center } from "@/components/ui/center";
import CommentInfo from "@/components/comment-info";
import HeartInfo from "@/components/heart-info";
import AuthorInfo from "@/components/author-info";

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

  const cover = files && files[0];

  const content = post?.content;
  const author = post?.author;
  const publishedAt =
    post && moment(post.publishedAt).format("YYYY-MM-DD h:mm:ss");

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
            {cover ? (
              <Box className="w-full h-48">
                <Image
                  source={{
                    uri: `${baseURL}/${cover.small.url}`,
                  }}
                  alt={cover.alternativeText}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                  }}
                />
                <TouchableOpacity className="absolute right-16 -bottom-4 w-8 h-8 bg-secondary-500 rounded-full justify-center items-center drop-shadow-xl">
                  <Icon
                    size="md"
                    className="text-secondary-0"
                    as={BookMarked}
                  />
                </TouchableOpacity>
                <TouchableOpacity className="absolute right-4 -bottom-4 w-8 h-8 bg-secondary-500 rounded-full justify-center items-center drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={Share2} />
                </TouchableOpacity>
              </Box>
            ) : (
              <HStack className="justify-end items-center" space="md">
                <TouchableOpacity className="w-8 h-8 bg-secondary-500 rounded-full justify-center items-center drop-shadow-xl">
                  <Icon
                    size="md"
                    className="text-secondary-0"
                    as={BookMarked}
                  />
                </TouchableOpacity>
                <TouchableOpacity className="w-8 h-8 bg-secondary-500 rounded-full justify-center items-center drop-shadow-xl">
                  <Icon size="md" className="text-secondary-0" as={Share2} />
                </TouchableOpacity>
              </HStack>
            )}

            <HStack space="md">
              <Text size="sm"> {publishedAt}</Text>
            </HStack>
            <HStack className="justify-between items-center">
              <AuthorInfo author={author} />
              <HStack space="lg" className="flex-row items-center">
                <HeartInfo />
                <CommentInfo />
              </HStack>
            </HStack>

            {files?.length > 1 && (
              <FlashList
                data={files.slice(1)}
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
