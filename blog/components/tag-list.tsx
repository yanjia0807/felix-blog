import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

export const TagList = ({ tags, onRemove, className }: any) => {
  return (
    <HStack space="sm" className={twMerge('my-2 flex-wrap', className)}>
      {tags.map((item: any) => (
        <ButtonGroup key={item.id} space="xs" isAttached={true} className={twMerge(className)}>
          <Button
            size="xs"
            action="secondary"
            className="items-center justify-start rounded-lg"
            onPress={() => onRemove && onRemove(item.id)}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        </ButtonGroup>
      ))}
    </HStack>
  );
};
