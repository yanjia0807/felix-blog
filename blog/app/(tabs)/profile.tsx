import React, { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { EditIcon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Calendar, MapPin, MessageCircle, ScanFace } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Divider } from "@/components/ui/divider";
import { router, Stack } from "expo-router";
import { Icon } from "@/components/ui/icon";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { FlashList, MasonryFlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Dimensions } from "react-native";
import { baseURL, useFetchPosts } from "@/api";

const { width } = Dimensions.get("window");
const numColumns = 2;

const PostListView = () => {
  const { data: posts, error, isLoading, isSuccess } = useFetchPosts();

  const renderItem = ({ item }: any) => {
    return (
      <Card className="rounded-lg my-2">
        <Text className="text-sm font-normal mb-2 text-typography-700">
          {item.publishedAt}
        </Text>
        <VStack className="mb-6">
          <Heading size="md" className="mb-4">
            {item.title}
          </Heading>
          <Text size="sm">{item.content}</Text>
        </VStack>
      </Card>
    );
  };

  return (
    <Box className="flex-1">
      {isLoading && <Spinner />}
      <FlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={200}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </Box>
  );
};

const PhotoListView = () => {
  const [photos, setPhotos] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?page=${page}&limit=15`
      );
      const data = await response.json();
      setPhotos((prevPhotos: any) => [...prevPhotos, ...data]);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const renderItem = ({ item }: any) => {
    return (
      <Image
        recyclingKey={item.id}
        source={{ uri: item.download_url }}
        contentFit="cover"
        style={{
          flex: 1,
          aspectRatio: 1,
          marginLeft: 1,
        }}
        alt={`Photo by ${item.author}`}
      />
    );
  };

  return (
    <Box className="flex-1 mr-1/4">
      <MasonryFlashList
        data={photos}
        getItemType={() => "image"}
        renderItem={renderItem}
        numColumns={numColumns}
        ItemSeparatorComponent={() => <Box style={{ marginBottom: 1 }} />}
        estimatedItemSize={width / numColumns}
        onEndReached={fetchPhotos}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

const Profile = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <Stack.Screen
        options={{
          title: "我的",
        }}
      />
      <VStack className="p-8 flex-1" space="xl">
        <HStack className="justify-between items-center">
          <Avatar size="lg">
            <AvatarImage
              alt="Profile Image"
              source={require("@/assets/images/profile/WechatIMG113.jpeg")}
            />
          </Avatar>
          <HStack className="items-center" space="lg">
            <Button size="sm" className="rounded-full p-2.5" variant="outline">
              <ButtonIcon as={MessageCircle} />
            </Button>
            <Button
              size="sm"
              className="rounded-3xl px-6"
              onPress={() => {
                router.push("/profile-edit");
              }}
            >
              <ButtonText>编辑</ButtonText>
              <ButtonIcon as={EditIcon} />
            </Button>
          </HStack>
        </HStack>
        <VStack space="md">
          <Text size="3xl" bold={true}>
            颜0807
          </Text>
          <HStack space="md" className="items-center">
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={Calendar} />
              <Text size="xs">1984-08-07</Text>
            </HStack>
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={ScanFace} />
              <Text size="xs">男</Text>
            </HStack>
            <HStack className="items-center" space="xs">
              <Icon size="xs" as={MapPin} />
              <Text size="xs">重庆｜南岸区</Text>
            </HStack>
          </HStack>
        </VStack>
        <Divider />
        <HStack space="md" className="justify-around">
          <VStack className="items-center justify-center">
            <Text size="xl" bold={true}>
              400
            </Text>
            <Text size="sm">帖子</Text>
          </VStack>
          <VStack className="items-center justify-center">
            <Text size="xl" bold={true}>
              21
            </Text>
            <Text size="sm">关注</Text>
          </VStack>
          <VStack className="items-center justify-center">
            <Text size="xl" bold={true}>
              3
            </Text>
            <Text size="sm">被关注</Text>
          </VStack>
        </HStack>
        <Divider />
        <SegmentedControl
          values={["我的帖子", "照片墙"]}
          selectedIndex={selectedIndex}
          onChange={(event) =>
            setSelectedIndex(event.nativeEvent.selectedSegmentIndex)
          }
        />
        {selectedIndex === 0 ? <PostListView /> : <PhotoListView />}
      </VStack>
    </>
  );
};

export default Profile;
