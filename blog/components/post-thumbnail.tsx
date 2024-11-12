import { View } from 'react-native';
import React from 'react';
import { HStack } from './ui/hstack';
import { Box } from './ui/box';
import { Text } from './ui/text';
import { Image } from 'expo-image';
import { VStack } from './ui/vstack';
import { baseURL } from '@/api';
import { BlurView } from 'expo-blur';
import { Center } from './ui/center';

const PostThumbnail = ({ item }: any) => {
  const files = item?.blocks
    ? item?.blocks
        .find((item: any) => item['__component'] === 'shared.attachment')
        ?.files?.map((item: any) => ({
          id: item.id,
          name: item.name,
          alternativeText: item.alternativeText,
          thumbnail: item.formats?.thumbnail,
        }))
    : [];

  return (
    <>
      {files?.length > 0 && (
        <HStack className="h-48" space="sm">
          <Box className="grow">
            <Image
              source={{
                uri: `${baseURL}${files[0].thumbnail.url}`,
              }}
              alt={item.alternativeText}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 12,
              }}
            />
          </Box>
          {files?.length > 1 && (
            <VStack className="w-1/3" space="sm">
              {files.map((item: any, index: number) => {
                if (index > 0 && index < 4) {
                  if (files.length > 4 && index == 3) {
                    return (
                      <Box key={item.id} className="flex-1">
                        <Center className="absolute bottom-0 left-0 right-0 top-0 z-10">
                          <Text
                            bold={true}
                            className="text-white"
                            size="md">{`+${files.length - 4}`}</Text>
                        </Center>
                        <BlurView className="flex-1" intensity={40} tint="default">
                          <Image
                            source={{
                              uri: `${baseURL}${item.thumbnail.url}`,
                            }}
                            alt={item.alternativeText}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 12,
                            }}
                          />
                        </BlurView>
                      </Box>
                    );
                  }

                  return (
                    <Box key={item.id} className="flex-1">
                      <Image
                        source={{
                          uri: `${baseURL}${item.thumbnail.url}`,
                        }}
                        alt={item.alternativeText}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 12,
                        }}
                      />
                    </Box>
                  );
                }
              })}
            </VStack>
          )}
        </HStack>
      )}
    </>
  );
};

export default PostThumbnail;
