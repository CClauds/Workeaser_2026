import React, { ReactElement, cloneElement } from "react";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
  extraClass?: string;
}

export const ActiveLink: React.FC<ActiveLinkProps> = ({
  children,
  activeClassName,
  extraClass,
  ...rest
}) => {
  const { asPath } = useRouter();

  const [path] = asPath.split("?");

  const className =
    path === rest.href
      ? `${activeClassName} ${extraClass}`
      : path === `${rest.href}/add`
      ? activeClassName
      : extraClass;

  return (
    <Link {...rest} legacyBehavior>
      {cloneElement(children, {
        className,
      })}
    </Link>
  );
};
