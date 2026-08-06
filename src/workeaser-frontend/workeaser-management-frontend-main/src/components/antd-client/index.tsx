/**
 * Barrel module that re-exports antd components via `next/dynamic` with
 * `ssr: false`. Use this instead of `import { X } from 'antd'` in any page
 * (or component used in a page) that has `getServerSideProps` /
 * `getStaticProps`.
 *
 * Why this exists
 * ----------------
 * antd 5 + the rc-* family + dayjs 1.x ship internal ESM modules that use
 * extension-less imports (e.g. `import 'rc-util/es/Dom/canUseDom'`). Node
 * 20+ in strict ESM mode refuses to resolve these without `.js`. During
 * `next build`, the "Collecting page data" step loads each page module via
 * Node's native ESM loader, and that step explodes on the antd dependency
 * chain.
 *
 * Wrapping every antd import through `dynamic(() => import('antd'), { ssr: false })`
 * ensures the antd module is only ever evaluated in the browser — Node never
 * touches it during page-data collection, build succeeds, and the components
 * still render exactly the same way after hydration.
 *
 * Trade-off: SSR for these components is replaced with a tiny placeholder.
 * For an internal SaaS UI behind auth this is acceptable.
 */
import type {
  AlertProps,
  ButtonProps,
  ColProps,
  EmptyProps,
  ImageProps,
  RowProps,
  SkeletonProps,
  SpaceProps,
  SpinProps,
  TableProps,
  TooltipProps,
} from "antd";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const ssrFalse = { ssr: false as const };

export const Alert = dynamic<AlertProps>(
  () => import("antd").then((m) => m.Alert) as Promise<ComponentType<AlertProps>>,
  ssrFalse
);

export const Button = dynamic<ButtonProps>(
  () => import("antd").then((m) => m.Button) as Promise<ComponentType<ButtonProps>>,
  ssrFalse
);

export const Col = dynamic<ColProps>(
  () => import("antd").then((m) => m.Col) as Promise<ComponentType<ColProps>>,
  ssrFalse
);

export const Empty = dynamic<EmptyProps>(
  () => import("antd").then((m) => m.Empty) as Promise<ComponentType<EmptyProps>>,
  ssrFalse
);

export const Image = dynamic<ImageProps>(
  () => import("antd").then((m) => m.Image) as Promise<ComponentType<ImageProps>>,
  ssrFalse
);

export const Row = dynamic<RowProps>(
  () => import("antd").then((m) => m.Row) as Promise<ComponentType<RowProps>>,
  ssrFalse
);

export const Skeleton = dynamic<SkeletonProps>(
  () => import("antd").then((m) => m.Skeleton) as Promise<ComponentType<SkeletonProps>>,
  ssrFalse
);

export const Space = dynamic<SpaceProps>(
  () => import("antd").then((m) => m.Space) as Promise<ComponentType<SpaceProps>>,
  ssrFalse
);

export const Spin = dynamic<SpinProps>(
  () => import("antd").then((m) => m.Spin) as Promise<ComponentType<SpinProps>>,
  ssrFalse
);

// Table is generic over the row type — wrap explicitly with `any` to keep ergonomics.
export const Table = dynamic<TableProps<any>>(
  () => import("antd").then((m) => m.Table) as Promise<ComponentType<TableProps<any>>>,
  ssrFalse
);

export const Tooltip = dynamic<TooltipProps>(
  () => import("antd").then((m) => m.Tooltip) as Promise<ComponentType<TooltipProps>>,
  ssrFalse
);
