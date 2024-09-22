/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/posts` | `/(tabs)/posts/` | `/(tabs)/profile` | `/(tabs)/profile/` | `/_sitemap` | `/auth` | `/posts` | `/posts/` | `/profile` | `/profile/`;
      DynamicRoutes: `/(tabs)/posts/${Router.SingleRoutePart<T>}` | `/posts/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(tabs)/posts/[slug]` | `/posts/[slug]`;
    }
  }
}
