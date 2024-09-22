import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";

export const CustomBottomSheet = forwardRef<BottomSheet>((props, ref) => {
  const snapPoints = useMemo(() => ["70%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
    >
      <BottomSheetView
        className="flex-1 bg-primary-foreground"
        children={undefined}
      ></BottomSheetView>
    </BottomSheet>
  );
});
