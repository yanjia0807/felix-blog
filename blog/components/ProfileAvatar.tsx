import { View, Text } from "react-native";
import React from "react";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
  AvatarBadge,
} from "./ui/avatar";
import { useAuth } from "./AuthContext";
import { baseURL } from "@/api/config";
import { Icon } from "./ui/icon";
import { User } from "lucide-react-native";

export const ProfileAvatar = () => {
  const { user } = useAuth();
  return (
    <>
      {user ? (
        <Avatar size="sm" className="mx-2">
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${baseURL}/${user.profile?.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
      ) : (
        <Avatar size="sm" className="mx-2">
          <Avatar size="sm" className="text-info-400">
            <Icon as={User} size="sm" className="text-info-400" />
          </Avatar>
        </Avatar>
      )}
    </>
  );
};
