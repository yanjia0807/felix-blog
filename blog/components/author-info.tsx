import React from "react";
import { HStack } from "./ui/hstack";
import { Text } from "./ui/text";
import { baseURL } from "@/api";
import { Avatar, AvatarImage } from "./ui/avatar";
import { VStack } from "./ui/vstack";

const AuthorInfo = ({ author }: any) => {
  return (
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
          {author?.profile?.nickname || author?.username}
        </Text>
      </VStack>
    </HStack>
  );
};

export default AuthorInfo;