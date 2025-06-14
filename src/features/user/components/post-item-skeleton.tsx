import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';
import React from 'react';

export const PostItemSkeleton: React.FC<any> = ({ index }) => (
  <VStack
    space="md"
    className={`${index === 0 ? 'mt-0' : 'mt-6'} w-full rounded-lg bg-background-100 p-2`}>
    <SkeletonText className="h-3 w-52" />
    <HStack className="items-center justify-between" space="sm">
      <Skeleton variant="rounded" className="h-3 w-32" />
      <Skeleton variant="rounded" className="h-3 w-32" />
    </HStack>
    <SkeletonText _lines={2} className="h-3" />
  </VStack>
);
