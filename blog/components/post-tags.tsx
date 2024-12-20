import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Button, ButtonGroup, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

const PostTags = ({ tags, onRemoveTag, className }: any) => {
  return (
    <HStack space="sm" className={twMerge('my-2 flex-wrap', className)}>
      {tags.map((item: any) => (
        <PostTagIcon key={item.id} tag={item} onRemoveTag={onRemoveTag} />
      ))}
    </HStack>
  );
};

const PostTagIcon = ({ tag, onRemoveTag, className }: any) => {
  return (
    <ButtonGroup space="xs" isAttached={true} className={twMerge(className)}>
      <Button
        size="xs"
        action="secondary"
        className="items-center justify-start rounded-lg"
        onPress={() => onRemoveTag && onRemoveTag(tag)}>
        <ButtonText>{tag.name}</ButtonText>
      </Button>
    </ButtonGroup>
  );
};

export default PostTags;
