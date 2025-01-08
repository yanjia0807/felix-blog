import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { Check } from 'lucide-react-native';
import React from 'react';
import { fetchTags } from '@/api';
import { Badge, BadgeIcon, BadgeText } from './ui/badge';
import { HStack } from './ui/hstack';
import { Pressable } from './ui/pressable';

const TagSelect = ({ value = [], onChange }: any) => {
  const { isLoading, data } = useQuery({
    queryKey: ['tags', 'list'],
    queryFn: fetchTags,
  });

  const onTagItemPress = (item: any) => {
    if (_.includes(value, item.documentId)) {
      onChange(_.filter(value, (val: any) => val !== item.documentId));
    } else {
      onChange([...value, item.documentId]);
    }
  };

  return (
    <HStack space="sm" className="flex-wrap">
      {data?.map((item: any) => (
        <Pressable onPress={() => onTagItemPress(item)} key={item.id}>
          <Badge size="lg" variant="outline" className="mx-2 rounded">
            <BadgeText className="mr-2">{item.name}</BadgeText>
            {_.includes(value, item.documentId) && (
              <BadgeIcon as={Check} className="absolute right-0" />
            )}
          </Badge>
        </Pressable>
      ))}
    </HStack>
  );
};

export default TagSelect;
