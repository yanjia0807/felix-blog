import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Text } from "./ui/text";
import { Button } from "./ui/button";

export const InfoDialog = ({ title = "提示", description, open }: any) => {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button onPress={() => setIsOpen(false)}>
              <Text>关闭</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
