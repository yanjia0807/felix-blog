import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

const CustomActivityIndicator = (props: any) => {
  return (
    <ActivityIndicator
      {...props}
      className="flex-1 justify-center items-center top-0 right-0 bottom-0 left-0 absolute z-20"
    ></ActivityIndicator>
  );
};

export default CustomActivityIndicator;
