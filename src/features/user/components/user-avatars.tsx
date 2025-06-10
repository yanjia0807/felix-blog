import { Avatar, AvatarFallbackText, AvatarGroup, AvatarImage } from '@/components/ui/avatar';
import { imageFormat } from '@/utils/file';
import _ from 'lodash';
import React from 'react';

export const UserAvatars = ({ users }: any) => {
  return (
    <AvatarGroup>
      {_.map(users, (user: any) => (
        <Avatar size="xs" key={user.documentId}>
          {user.avatar ? (
            <AvatarImage
              source={{
                uri: imageFormat(user.avatar, 's', 't')?.fullUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>{user.username}</AvatarFallbackText>
          )}
        </Avatar>
      ))}
    </AvatarGroup>
  );
};
