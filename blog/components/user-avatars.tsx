import _ from 'lodash';
import React from 'react';
import { apiServerURL } from '@/api';
import { Avatar, AvatarFallbackText, AvatarGroup, AvatarImage } from './ui/avatar';

const UserAvatars = ({ users }: any) => {
  return (
    <AvatarGroup>
      {_.map(users, (user: any) => (
        <Avatar size="xs" key={user.documentId}>
          <AvatarFallbackText>{user.username}</AvatarFallbackText>
          <AvatarImage
            source={{
              uri: `${apiServerURL}${user.avatar?.formats.thumbnail.url}`,
            }}
          />
        </Avatar>
      ))}
    </AvatarGroup>
  );
};

export default UserAvatars;
