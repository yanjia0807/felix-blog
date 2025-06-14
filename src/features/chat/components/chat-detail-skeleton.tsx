import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import { Stack, useRouter } from 'expo-router';
import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';

const SenderItemSkeleton = () => {
  return (
    <HStack className="my-1 items-center justify-between" space="sm">
      <Skeleton variant="rounded" className="h-3 w-24" />
      <Card size="md" variant="elevated" className="flex-1 flex-grow rounded-md p-4">
        <SkeletonText className="h-3 w-full" _lines={2} />
      </Card>
    </HStack>
  );
};

const ReceiverItemSkeleton = () => {
  return (
    <HStack>
      <Skeleton variant="circular" className="h-6 w-6" />
      <HStack className="flex-1 items-center justify-between">
        <Card size="md" variant="elevated" className="m-3 w-2/3 rounded-md p-4">
          <SkeletonText className="h-3 w-full" _lines={2} />
        </Card>
        <View className="flex-1">
          <Skeleton variant="rounded" className="h-3 w-full" />
        </View>
      </HStack>
    </HStack>
  );
};

export const ChatDetailSkeleton: React.FC<any> = () => {
  const router = useRouter();

  const placeholders = _.map(new Array(2), (item, index) => ({
    documentId: _.uniqueId(),
    sender: index % 2 === 0,
  }));

  const renderHeaderLeft = () => (
    <HStack className="items-center" space="xl">
      <Button action="secondary" variant="link" onPress={() => router.dismissTo('/chat')}>
        <ButtonText>返回</ButtonText>
      </Button>
    </HStack>
  );

  return (
    <SafeAreaView className="flex-1">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerLeft: renderHeaderLeft,
        }}
      />
      <VStack className="flex-1 justify-between">
        <VStack className="flex-1 p-4">
          {placeholders.map((item: any) =>
            item.sender ? (
              <SenderItemSkeleton key={item.documentId} />
            ) : (
              <ReceiverItemSkeleton key={item.documentId} />
            ),
          )}
        </VStack>
        <VStack className="px-4">
          <Skeleton variant="rounded" className="h-11 w-full rounded-3xl" />
        </VStack>
      </VStack>
    </SafeAreaView>
  );
};
