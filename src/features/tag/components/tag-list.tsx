import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import _ from 'lodash';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export const TagList = ({ value = [], onChange, className, readonly = false }: any) => {
  const onRemove = (id: any) => {
    onChange(_.filter(value, (item: any) => item.id !== id));
  };

  const onRemoveAll = (id: any) => {
    onChange([]);
  };

  if (value?.length > 0) {
    return (
      <HStack space="sm" className={twMerge('flex-wrap', className)}>
        {value.map((item: any) => (
          <Button
            size="sm"
            action="secondary"
            onPress={() => !readonly && onRemove(item.id)}
            key={item.id}>
            <ButtonText>{item.name}</ButtonText>
          </Button>
        ))}
        {!readonly && (
          <Button
            onPress={onRemoveAll}
            key={0}
            size="sm"
            action="secondary"
            variant="link"
            className="ml-3">
            <ButtonText>清空</ButtonText>
          </Button>
        )}
      </HStack>
    );
  }
};
