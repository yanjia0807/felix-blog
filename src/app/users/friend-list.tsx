import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/features/auth/components/auth-provider';
import { useFetchFriends } from '@/features/user/api/use-fetch-friends';
import UserList from '@/features/user/components/user-list';
import useDebounce from '@/hooks/use-debounce';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';

const FriendListPage: React.FC = () => {
  const [keywords, setKeywords] = useState<string>('');
  const { user: currentUser } = useAuth();
  const { userDocumentId, username } = useLocalSearchParams();
  const isMe = currentUser?.documentId === userDocumentId;

  const debounceKeywords = useDebounce(keywords, 500);
  const filters = {
    userDocumentId,
    keywords: debounceKeywords,
  };

  const friendsQuery = useFetchFriends({ filters });

  const users: any = _.flatMap(friendsQuery.data?.pages, (page) => page.data);

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.back();
      }}>
      <ButtonText>返回</ButtonText>
    </Button>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: `${isMe ? '我' : username}的好友`,
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        <UserList
          data={users}
          isLoading={friendsQuery.isLoading}
          refetch={friendsQuery.refetch}
          fetchNextPage={friendsQuery.fetchNextPage}
          hasNextPage={friendsQuery.hasNextPage}
          isFetchingNextPage={friendsQuery.isFetchingNextPage}
          value={keywords}
          onChange={setKeywords}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default FriendListPage;
