import React from 'react';
import _ from 'lodash';
import { thumbnailSize } from '@/utils/file';
import { Avatar, AvatarFallbackText, AvatarGroup, AvatarImage } from './ui/avatar';

const UserAvatars = ({ users }: any) => {
  return (
    <AvatarGroup>
      {_.map(users, (user: any) => (
        <Avatar size="xs" key={user.documentId}>
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: thumbnailSize(user.avatar),
            }}
          />
        </Avatar>
      ))}
    </AvatarGroup>
  );
};

export default UserAvatars;
