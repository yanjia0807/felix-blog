import React from "react";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ChevronRightIcon, EditIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { type LucideIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarBadge, AvatarImage } from "@/components/ui/avatar";
import { Center } from "@/components/ui/center";
import { ScrollView } from "react-native";
import { Divider } from "@/components/ui/divider";
import { GlobeIcon, InboxIcon } from "lucide-react-native";
import { router } from "expo-router";

interface UserStats {
  friends: string;
  friendsText: string;
  followers: string;
  followersText: string;
  rewards: string;
  rewardsText: string;
  posts: string;
  postsText: string;
}
const userData: UserStats[] = [
  {
    friends: "45K",
    friendsText: "朋友",
    followers: "500M",
    followersText: "被关注",
    rewards: "40",
    rewardsText: "点赞",
    posts: "346",
    postsText: "帖子",
  },
];

interface AccountCardType {
  iconName: LucideIcon | typeof Icon;
  subText: string;
  endIcon: LucideIcon | typeof Icon;
}
const accountData: AccountCardType[] = [
  {
    iconName: InboxIcon,
    subText: "设置",
    endIcon: ChevronRightIcon,
  },
  {
    iconName: GlobeIcon,
    subText: "通知",
    endIcon: ChevronRightIcon,
  },
];

const Profile = () => {
  return (
    <VStack className="h-full w-full mb-16 md:mb-0">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 160,
          flexGrow: 1,
        }}
      >
        <VStack className="h-full w-full pb-8" space="2xl">
          <Center className="absolute mt-6 w-full pb-4">
            <VStack space="lg" className="items-center">
              <Avatar size="2xl" className="bg-primary-600">
                <AvatarImage
                  alt="Profile Image"
                  source={require("@/assets/images/profile/WechatIMG113.jpeg")}
                />
                <AvatarBadge />
              </Avatar>
              <VStack className="gap-1 w-full items-center">
                <Text size="2xl" className="font-roboto text-dark">
                  YanJia0807
                </Text>
                <Text className="font-roboto text-sm text-typograpphy-700">
                  重庆
                </Text>
              </VStack>
              <>
                {userData.map((item, index) => {
                  return (
                    <HStack className="items-center gap-1" key={index}>
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold justify-center items-center">
                          {item.friends}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.friendsText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.followers}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.followersText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.rewards}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.rewardsText}
                        </Text>
                      </VStack>
                      <Divider orientation="vertical" className="h-10" />
                      <VStack className="py-3 px-4 items-center" space="xs">
                        <Text className="text-dark font-roboto font-semibold">
                          {item.posts}
                        </Text>
                        <Text className="text-dark text-xs font-roboto">
                          {item.postsText}
                        </Text>
                      </VStack>
                    </HStack>
                  );
                })}
              </>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => {
                  router.push("./profile/edit");
                }}
                className="gap-3 relative"
              >
                <ButtonText className="text-dark">编辑资料</ButtonText>
                <ButtonIcon as={EditIcon} />
              </Button>
            </VStack>
          </Center>
          <VStack className="mx-6 mt-[380px]" space="2xl">
            <Heading className="font-roboto" size="xl">
              偏好设置
            </Heading>
            <VStack className="py-2 px-4 border rounded-xl border-border-300 justify-between items-center">
              {accountData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    <HStack
                      space="2xl"
                      className="justify-between items-center w-full flex-1 py-3 px-2"
                      key={index}
                    >
                      <HStack className="items-center" space="md">
                        <Icon as={item.iconName} className="stroke-[#747474]" />
                        <Text size="lg">{item.subText}</Text>
                      </HStack>
                      <Icon as={item.endIcon} />
                    </HStack>
                    {accountData.length - 1 !== index && (
                      <Divider className="my-1" />
                    )}
                  </React.Fragment>
                );
              })}
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
};

export default Profile;
