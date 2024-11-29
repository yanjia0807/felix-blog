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
    <ButtonGroup space="sm" isAttached={true} className={PostTagIconStyles({ className })}>
      <Button size="sm" className="items-center justify-start rounded-xl">
        <ButtonText>{tag.name}</ButtonText>
        {onRemoveTag && <ButtonIcon as={CircleX} onPress={() => onRemoveTag(tag)} />}
      </Button>
    </ButtonGroup>
  );
};

export default PostTags;
