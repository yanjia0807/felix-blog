import React, { forwardRef, useEffect, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";
import { VStack } from "./ui/vstack";
import { Text } from "./ui/text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField } from "./ui/input";
import { FlashList } from "@shopify/flash-list";
import { Button, ButtonText } from "./ui/button";
import { H1 } from "@expo/html-elements";
import { HStack } from "./ui/hstack";

const tagsData = [
  { id: 1, slug: "travel", name: "旅行" },
  { id: 2, slug: "food", name: "美食" },
  { id: 3, slug: "fitness", name: "健身" },
  { id: 4, slug: "photography", name: "摄影" },
  { id: 5, slug: "fashion", name: "时尚" },
  { id: 6, slug: "technology", name: "科技" },
  { id: 7, slug: "movies", name: "电影" },
  { id: 8, slug: "music", name: "音乐" },
  { id: 9, slug: "reading", name: "读书" },
  { id: 10, slug: "art", name: "艺术" },
  { id: 11, slug: "pets", name: "宠物" },
  { id: 12, slug: "gaming", name: "游戏" },
  { id: 13, slug: "home", name: "家居" },
  { id: 14, slug: "history", name: "历史" },
  { id: 15, slug: "culture", name: "文化" },
  { id: 16, slug: "entrepreneurship", name: "创业" },
  { id: 17, slug: "psychology", name: "心理学" },
];

const TagSheet = forwardRef(({ onSuccessed }: any, ref: any) => {
  useEffect(() => {}, []);
  const insets = useSafeAreaInsets();
  const [selectedTags, setSelectedTags] = useState<any>([]);

  const toggleTag = (tag: any) => {
    setSelectedTags((prev: any) =>
      prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag]
    );
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        className="w-full justify-start border-b-[0.5px] border-secondary-50 py-2"
        onPress={() => toggleTag(item.id)}
      >
        <Text className="w-full">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheetModal
      snapPoints={["100%"]}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      ref={ref}
    >
      <BottomSheetView
        className="flex-1 px-4"
        style={{ marginTop: insets.top, marginBottom: insets.bottom }}
      >
        <H1>标签</H1>
        <Input
          variant="rounded"
          size="md"
          isDisabled={false}
          isInvalid={false}
          isReadOnly={false}
          className="my-8"
        >
          <InputField placeholder="搜索标签..." />
        </Input>
        <FlashList
          data={tagsData}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TagSheet;
