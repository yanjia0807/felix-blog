import { useForm, Controller } from "react-hook-form";
import { View } from "react-native";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Small } from "./ui/typography";
import { MailInput } from "./mail-input";
import { Button } from "./ui/button";
import { Text } from "~/components/ui/text";
import { PasswordInput } from "./password-input";
import { UserInput } from "./user-input";
import CustomActivityIndicator from "./activityIndicator";
import { InfoDialog } from "./info-dialog";
import { useAuth } from "./auth-context";
import { Link, router } from "expo-router";

export const RegisterView = ({ animateViewTransition }: any) => {
  const { onRegister, authState } = useAuth();
  const isPresented = router.canGoBack();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ mode: "onBlur" });

  const mutation = onRegister();

  if (mutation.isSuccess) {
  }

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const handleViewSwith = () => {
    animateViewTransition("Login");
  };

  const handleModalClose = () => {};

  return (
    <View className="flex-1">
      {mutation.isPending && <CustomActivityIndicator />}
      {mutation.isError && (
        <InfoDialog open={true} description={errors.message} />
      )}
      <Card className="flex-1 w-full border-0 shadow-none">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>用户名长度需在3到16个字符之间</CardDescription>
          <CardDescription>密码长度至少为8个字符</CardDescription>
        </CardHeader>
        <CardContent>
          <Controller
            control={control}
            render={({ field }) => <UserInput field={field} />}
            name="username"
            rules={{
              required: "请输入用户名",
              pattern: {
                value: /^[\p{L}\p{N}_-]{3,16}$/u,
                message: "用户名长度需在3到16个字符之间",
              },
            }}
          />
          {errors.username && (
            <Text className="color-red-400 mb-2">
              {errors.username?.message?.toString()}
            </Text>
          )}

          <Controller
            control={control}
            render={({ field }) => <MailInput field={field} />}
            name="email"
            rules={{
              required: "请输入邮箱地址",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "邮箱地址格式不正确",
              },
            }}
          />
          {errors.email && (
            <Text className="color-red-400 mb-2">
              {errors.email?.message?.toString()}
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
            <Small>已有账号请登录</Small>
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
};
