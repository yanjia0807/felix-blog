import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

export const UserDetailSkeleton: React.FC<any> = () => (
  <VStack space="md" className="flex-1">
    <HStack className="items-center justify-between">
      <HStack className="items-center" space="md">
        <Skeleton variant="circular" className="h-16 w-16" />
        <SkeletonText className="h-4 w-24" />
      </HStack>
      <HStack className="items-center" space="sm">
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton variant="circular" className="h-10 w-10" />
        <Skeleton variant="circular" className="h-10 w-10" />
      </HStack>
    </HStack>
    <HStack className="items-center" space="sm">
      <SkeletonText className="h-3 w-16" />
      <SkeletonText className="h-3 w-16" />
      <SkeletonText className="h-3 w-16" />
    </HStack>
    <SkeletonText _lines={3} className="h-3" />
    <Skeleton variant="rounded" className="my-2 h-16 w-full" />
    <HStack space="sm">
      <Skeleton variant="rounded" className="h-8 flex-1" />
      <Skeleton variant="rounded" className="h-8 flex-1" />
    </HStack>
  </VStack>
);
