module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "~": "./",
          },
          extensions: [
            ".ios.ts",
            ".android.ts",
            ".ios.tsx",
            ".android.tsx",
            ".ts",
            ".tsx",
            ".jsx",
            ".js",
            ".json",
          ],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
