import { Button, ButtonText } from '@/components/ui/button';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { VStack } from '@/components/ui/vstack';
import { useFetchUsers } from '@/features/user/api/use-fetch-users';
import UserList from '@/features/user/components/user-list';
import useDebounce from '@/hooks/use-debounce';
import { router, Stack } from 'expo-router';
import _ from 'lodash';
import React, { useState } from 'react';

const SearchUserListPage: React.FC = () => {
  const [keywords, setKeywords] = useState<string>('');

  const debounceKeywords = useDebounce(keywords, 500);

  const filters = {
    keywords: debounceKeywords,
  };

  const usersQuery = useFetchUsers({ filters });

  const users: any = _.flatMap(usersQuery.data?.pages, (page) => page.data);

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
          title: '查询用户',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 p-4">
        <UserList
          data={users}
          isLoading={usersQuery.isLoading}
          refetch={usersQuery.refetch}
          fetchNextPage={usersQuery.fetchNextPage}
          hasNextPage={usersQuery.hasNextPage}
          isFetchingNextPage={usersQuery.isFetchingNextPage}
          value={keywords}
          onChange={setKeywords}
        />
      </VStack>
    </SafeAreaView>
  );
};

export default SearchUserListPage;
