import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView } from 'react-native';
import { apiServerURL } from '@/api';
import { useAuth } from '@/components/auth-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

const MessageHeader = () => {
  const { user }: any = useAuth();
  return (
    <HStack className="items-center justify-between">
      <HStack className="items-center" space="sm">
        <Avatar>
          <AvatarImage
            source={{
              uri: `${apiServerURL}/${user.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
        <Heading>我的消息</Heading>
      </HStack>

      <Button action="primary" size="md" variant="link" onPress={() => router.push('/add-friend')}>
        <ButtonText>查询用户</ButtonText>
      </Button>
    </HStack>
  );
};

const Chat = () => {
  const { user }: any = useAuth();
  const [messsages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return <Redirect href="/anonymous" />;
  }

  const renderListHeader = (props: any) => {
    return <MessageHeader {...props} />;
  };

  const renderItem = ({ item, index }: any) => {
    return <></>;
  };

  return (
    <>
      <SafeAreaView className="flex-1">
        <VStack className="flex-1 p-6">
          <FlatList
            data={messsages}
            ListHeaderComponent={renderListHeader}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {}}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => {}} />}
          />
        </VStack>
      </SafeAreaView>
    </>
  );
};

export default Chat;
