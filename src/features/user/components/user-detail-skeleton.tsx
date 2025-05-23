import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

export const UserDetailSkeleton = () => (
  <VStack space="xl">
    <HStack className="items-center" space="lg">
      <Skeleton variant="circular" className="h-24 w-24" />
      <VStack space="sm" className="flex-1">
        <SkeletonText _lines={2} className="h-2 w-1/2" />
      </VStack>
    </HStack>
    <SkeletonText _lines={3} className="h-2" />
    <Skeleton variant="rounded" className="my-2 h-20 w-full" />
    <HStack space="sm">
      <Skeleton variant="rounded" className="h-12 flex-1" />
      <Skeleton variant="rounded" className="h-12 flex-1" />
    </HStack>
    <Skeleton variant="rounded" className="mb-2 h-36 flex-1" />
    <Skeleton variant="rounded" className="h-36 flex-1" />
  </VStack>
);
