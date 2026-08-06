/**
 * Client-only re-exports for `@ant-design/icons`. Same rationale as
 * `@components/antd-client/index.tsx` — `@ant-design/icons` pulls in `rc-util`
 * which has extension-less ESM imports that Node 20+ refuses at build time.
 */
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const ssrFalse = { ssr: false as const };

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
  spin?: boolean;
  rotate?: number;
  twoToneColor?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

export const LoadingOutlined = dynamic<IconProps>(
  () =>
    import("@ant-design/icons").then(
      (m) => m.LoadingOutlined as unknown as ComponentType<IconProps>
    ),
  ssrFalse
);

export const CheckCircleTwoTone = dynamic<IconProps>(
  () =>
    import("@ant-design/icons").then(
      (m) => m.CheckCircleTwoTone as unknown as ComponentType<IconProps>
    ),
  ssrFalse
);

export const WarningTwoTone = dynamic<IconProps>(
  () =>
    import("@ant-design/icons").then(
      (m) => m.WarningTwoTone as unknown as ComponentType<IconProps>
    ),
  ssrFalse
);

export const IssuesCloseOutlined = dynamic<IconProps>(
  () =>
    import("@ant-design/icons").then(
      (m) => m.IssuesCloseOutlined as unknown as ComponentType<IconProps>
    ),
  ssrFalse
);
