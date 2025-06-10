import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { SafeAreaView } from '@/components/ui/safe-area-view';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import useCoverDimensions from '@/features/post/hooks/use-cover-dimensions';
import { Stack, useRouter } from 'expo-router';
import React from 'react';

export const PostDetailSkeleton: React.FC<any> = () => {
  const { coverWidth, coverHeight } = useCoverDimensions(14);
  const router = useRouter();

  const renderHeaderLeft = () => (
    <Button action="secondary" variant="link" onPress={() => router.back()}>
      <ButtonText>返回</ButtonText>
    </Button>
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
      <VStack className="p-4" space="md">
        <Skeleton variant="rounded" style={{ width: coverWidth, height: coverHeight }} />
        <SkeletonText _lines={1} className="h-4 w-80" />
        <HStack className="items-center justify-between">
          <SkeletonText className="h-3 w-24" />
          <SkeletonText className="h-3 w-24" />
        </HStack>
        <HStack className="items-center justify-between">
          <HStack className="items-center" space="xs">
            <Skeleton variant="circular" className="h-8 w-8" />
            <SkeletonText className="h-4 w-12" />
          </HStack>
          <Skeleton variant="sharp" className="h-3 w-24" />
        </HStack>
        <HStack className="items-center" space="sm">
          <Skeleton variant="rounded" className="h-8 w-12" />
          <Skeleton variant="rounded" className="h-8 w-12" />
        </HStack>
        <HStack className="items-center" space="sm">
          <Skeleton variant="rounded" className="h-14 w-14" />
          <Skeleton variant="rounded" className="h-14 w-14" />
          <Skeleton variant="rounded" className="h-14 w-14" />
        </HStack>
        <SkeletonText _lines={5} className="h-3" />
      </VStack>
    </SafeAreaView>
  );
};
