import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CircleX } from 'lucide-react-native';
import React from 'react';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from './ui/button';
import { HStack } from './ui/hstack';

const PostTags = ({ tags, onRemoveTag, className }: any) => {
  const PostTagsStyles = tva({});
  return (
    <HStack space="sm" className={`${PostTagsStyles({ className })} my-2 flex-wrap`}>
      {tags.map((item: any) => (
        <PostTagIcon key={item.id} tag={item} onRemoveTag={onRemoveTag} />
      ))}
    </HStack>
  );
};

const PostTagIcon = ({ tag, onRemoveTag, className }: any) => {
  const PostTagIconStyles = tva({});
  return (
    <ButtonGroup space="xs" isAttached={true} className={PostTagIconStyles({ className })}>
      <Button
        size="xs"
        action="secondary"
        variant="outline"
        className="items-center justify-start rounded-lg"
        onPress={() => onRemoveTag && onRemoveTag(tag)}>
        <ButtonText>{tag.name}</ButtonText>
      </Button>
    </ButtonGroup>
  );
};

export default PostTags;
