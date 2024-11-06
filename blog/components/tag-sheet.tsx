import React, { forwardRef, useEffect, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetBackdrop,
  BottomSheetDragIndicator,
} from "./ui/bottomsheet";
import { Text } from "./ui/text";
import { Heading } from "./ui/heading";
import { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const TagSheet = forwardRef(({ setTags }: any, ref: any) => {
  useEffect(() => {}, []);
  const [selectedTags, setSelectedTags] = useState<any>([]);
  const insets = useSafeAreaInsets();

  const toggleTag = (tag: any) => {
    setSelectedTags((prev: any) =>
      prev.includes(tag) ? prev.filter((t: any) => t !== tag) : [...prev, tag]
    );
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        className="w-full justify-start border-secondary-50 py-2"
        onPress={() => toggleTag(item.id)}
      >
        <Text className="w-full">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheetModal
      snapPoints={["50%"]}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={BottomSheetDragIndicator}
      keyboardBehavior="fillParent"
      ref={ref}
      style={{ marginTop: insets.top, marginBottom: insets.bottom }}
    >
      <BottomSheetView className="flex-1 px-4">
        <Heading size="lg">标签</Heading>
        <BottomSheetTextInput
          placeholder="搜索标签..."
          className="p-2 m-2 border rounded-2xl border-info-200"
        />
        <BottomSheetFlashList
          data={tagsData}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          estimatedItemSize={35}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default TagSheet;
