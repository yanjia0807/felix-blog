import React from "react";
import { Toast, ToastDescription, ToastTitle } from "./ui/toast";
import { Portal } from "./ui/portal";

const InfoToast = ({ description, action = "info", ...props }: any) => {
  const uniqueToastId =
    "toast-" + props.id || Math.random().toString(36).substr(2, 8);

  const titles: any = {
    error: "错误",
    warning: "警告",
    success: "成功",
    info: "提示",
    attention: "注意",
  };

  return (
    <Toast
      nativeID={uniqueToastId}
      action={action}
      variant="solid"
      className="z-50"
    >
      <ToastTitle>{titles[action]}</ToastTitle>
      <ToastDescription>{description}</ToastDescription>
    </Toast>
  );
};

export default InfoToast;
