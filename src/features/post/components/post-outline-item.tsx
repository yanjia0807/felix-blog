import React from 'react';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { UserAvatar } from '@/components/user';

const PostOutlineItem: React.FC<any> = ({ item }) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(`/posts/${item.documentId}`)}>
      <Card size="sm" variant="ghost">
        <HStack className="items-center justify-between">
          <Text>{item.title}</Text>
          <UserAvatar user={item.author}></UserAvatar>
        </HStack>
      </Card>
    </TouchableOpacity>
  );
};

export default PostOutlineItem;
