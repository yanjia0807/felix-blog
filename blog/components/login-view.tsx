import { useForm, Controller } from "react-hook-form";
import { View } from "react-native";
import { PasswordInput } from "./password-input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Small } from "./ui/typography";
import { Text } from "~/components/ui/text";
import { Button } from "./ui/button";
import CustomActivityIndicator from "./activityIndicator";
import { IdInput } from "./id-input";
import { InfoDialog } from "./info-dialog";
import { useAuth } from "./auth-context";
import { Link, router } from "expo-router";

export const LoginView = ({ animateViewTransition }: any) => {
  const { onLogin, authState } = useAuth();
  const isPresented = router.canGoBack();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onBlur" });

  const mutation = onLogin();

  if (mutation.isSuccess) {
  }

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleViewSwith = () => {
    animateViewTransition("register");
  };

  const handleModalClose = () => {};

  return (
    <View className="flex-1">
      {mutation.isPending && <CustomActivityIndicator />}
      {mutation.isError && <InfoDialog open={true} description={"登录失败"} />}
      <Card className="flex-1 w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>使用用户名/邮箱地址和密码登录</CardDescription>
          <CardDescription>密码长度至少为8个字符</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            render={({ field }) => <IdInput field={field} />}
            name="identifier"
            rules={{
              required: "请输入用户名/邮箱地址",
              pattern: {
                value: /^[\p{L}\p{N}_-]{3,}$/u,
                message: "用户名/邮箱地址格式不正确",
              },
            }}
          />
          {errors.identity && (
            <Text className="color-red-400 mb-2">
              {errors.identifier?.message?.toString()}
            </Text>
          )}
          <Controller
            control={control}
            render={({ field }) => <PasswordInput field={field} />}
            name="password"
            rules={{
              required: "请输入密码",
              pattern: {
                value: /^.{8,}$/,
                message: "密码长度至少为8个字符",
              },
            }}
          />
          {errors.password && (
            <Text className="color-red-400 mb-2">
              {errors.password?.message?.toString()}
            </Text>
          )}
          <View className="mt-8">
            <Button variant={"default"} onPress={handleSubmit(onSubmit)}>
              <Text>确定</Text>
            </Button>
            {isPresented && (
              <Link href="../" asChild>
                <Button variant="ghost" onPress={handleModalClose}>
                  <Text>取消</Text>
                </Button>
              </Link>
            )}
          </View>
        </CardContent>
        <CardFooter className="flex-row justify-center items-center">
          <Button variant={"link"} size={"sm"} onPress={handleViewSwith}>
            <Small>没有账号请注册</Small>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
};
