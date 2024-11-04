import React from "react";
import { router, Stack } from "expo-router";
import { Fab, FabLabel, FabIcon } from "@/components/ui/fab";
import { AddIcon, Icon } from "@/components/ui/icon";
import { FlashList } from "@shopify/flash-list";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { useFetchPosts } from "@/api";
import { VStack } from "@/components/ui/vstack";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Spinner } from "@/components/ui/spinner";
import colors from "tailwindcss/colors";
import { useToast } from "@/components/ui/toast";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Ellipsis, Heart, MessageCircle } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import PostThumbnail from "@/components/post-thumbnail";

const PostHome = () => {
  const { data: posts, error, isError, isLoading } = useFetchPosts();
  const toast = useToast();
  const renderItem = ({ item }: any) => {
    return (
      <Card className="p-5 rounded-lg mb-6">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/posts/[documentId]",
              params: {
                documentId: item.documentId,
              },
            });
          }}
        >
          <VStack space="md">
            <HStack className="justify-between items-center">
              <HStack className="items-center" space="sm">
                <Avatar size="sm">
                  <AvatarImage
                    source={require("@/assets/images/profile/image.png")}
                  />
                </Avatar>
                <VStack>
                  <Text size="xs" bold={true}>
                    颜0807
                  </Text>
                  <Text size="xs">30分钟之前</Text>
                </VStack>
              </HStack>
              <Icon as={Ellipsis} />
            </HStack>
            <Text numberOfLines={3}>{item.content}</Text>
            <PostThumbnail item={item} />
            <HStack className="justify-between items-center">
              <HStack space="lg" className="flex-row items-center">
                <TouchableOpacity>
                  <HStack space="xs" className="items-center">
                    <Icon as={Heart} color={colors.red[500]} />
                    <Text size="xs">321</Text>
                  </HStack>
                </TouchableOpacity>
                <TouchableOpacity>
                  <HStack space="xs" className="items-center">
                    <Icon as={MessageCircle} />
                    <Text size="xs">23</Text>
                  </HStack>
                </TouchableOpacity>
              </HStack>
              <HStack className="items-center">
                {Array(5)
                  .fill("https://i.pravatar.cc/150")
                  .map((item, index) => (
                    <Avatar
                      key={index}
                      size="xs"
                      style={{
                        position: "absolute",
                        right: index * 14,
                      }}
                    >
                      <AvatarImage
                        source={{
                          uri: item,
                        }}
                      />
                    </Avatar>
                  ))}
              </HStack>
            </HStack>
          </VStack>
        </TouchableOpacity>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Spinner
        size="small"
        className="absolute top-0 bottom-0 left-0 right-0"
        color={colors.gray[500]}
      />
    );
  }

  if (isError) {
    return <></>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "记录",
          headerShown: true,
          headerRight: () => <ProfileAvatar />,
        }}
      />
      <VStack className="flex-1 p-4" space="md">
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
          onPress={() => {
            router.push("/posts/create");
          }}
        >
          <FabIcon as={AddIcon} />
          <FabLabel>记录</FabLabel>
        </Fab>
      </VStack>
    </>
  );
};

export default PostHome;
