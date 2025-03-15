import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import _ from 'lodash';
import { ChevronLeft, Search } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { fetchFollowings } from '@/api';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarFallbackText, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { thumbnailSize } from '@/utils/file';

type FilterFormSchema = z.infer<typeof filterFormSchema>;

const filterFormSchema = z.object({
  keyword: z.string().optional(),
});

const FollowingList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { documentId, username } = useLocalSearchParams();
  const [keyword, setKeyword] = useState();

  const isMe = currentUser?.documentId === documentId;

  const { control, handleSubmit } = useForm<FilterFormSchema>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      keyword: undefined,
    },
  });

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['users', documentId, 'followings', { keyword }],
      queryFn: fetchFollowings,
      enabled: !!documentId,
      initialPageParam: {
        pagination: {
          page: 1,
          pageSize: 20,
        },
        documentId,
        keyword,
      },
      getNextPageParam: (lastPage: any) => {
        const {
          meta: {
            pagination: { page, pageSize, pageCount },
          },
        } = lastPage;

        if (page < pageCount) {
          return {
            pagination: { page: page + 1, pageSize },
            documentId,
            keyword,
          };
        }

        return null;
      },
    });

  const users: any = _.reduce(
    data?.pages,
    (result: any, item: any) => [...result, ...item.data],
    [],
  );

  const renderHeaderLeft = () => (
    <Button
      action="secondary"
      variant="link"
      onPress={() => {
        router.dismissAll();
      }}>
      <ButtonIcon as={ChevronLeft} />
      <ButtonText>返回</ButtonText>
    </Button>
  );

  const onSubmit = (formData: any) => {
    setKeyword(formData.keyword);
  };

  const renderInput = ({ field: { onBlur, onChange, value } }: any) => {
    return (
      <FormControl size="lg" className="flex-1">
        <Input className="my-2 w-full border p-3">
          <InputSlot>
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            placeholder="用户名/邮箱地址"
            inputMode="text"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            returnKeyType="search"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        </Input>
      </FormControl>
    );
  };

  const renderListHeader = () => {
    return (
      <HStack className="w-full items-center justify-between" space="md">
        <Controller name="keyword" control={control} render={renderInput} />
      </HStack>
    );
  };

  const onItemPress = (item: any) => {
    router.push(`/users/${item.documentId}`);
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        className={`rounded-lg py-2 ${index === 0 ? 'mt-0' : ''} border-b-hairline border-outline-200`}
        onPress={() => {
          onItemPress(item);
        }}>
        <HStack className={`items-center`} space="md">
          <Avatar size="sm">
            <AvatarFallbackText>{item.username}</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: thumbnailSize(item.avatar),
              }}
            />
          </Avatar>
          <VStack>
            <Text bold={true}>{item.username}</Text>
            <Text size="sm">{item.email}</Text>
          </VStack>
        </HStack>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: `${isMe ? '我' : username}关注的人`,
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 px-4">
        <FlatList
          data={users}
          ListHeaderComponent={renderListHeader}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => item.documentId}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                if (!isLoading) {
                  refetch();
                }
              }}
            />
          }
        />
      </VStack>
    </SafeAreaView>
  );
};

export default FollowingList;
