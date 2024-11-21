import { View, Text } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPostComments } from '@/api/comment';

const PostComments = ({ postDocumentId }: any) => {
  const {
    isPending,
    isError,
    isSuccess,
    data: comments,
    error,
  } = useQuery({
    queryKey: ['comments', postDocumentId],
    queryFn: () => fetchPostComments({ postDocumentId }),
  });

  console.log('comments', comments);

  return (
    <View>
      <Text></Text>
    </View>
  );
};

export default PostComments;
