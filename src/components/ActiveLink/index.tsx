import { ReactElement, cloneElement } from "react"

import Link, { LinkProps } from "../../../node_modules/next/link"

import { useRouter } from '../../../node_modules/next/router'

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest } : ActiveLinkProps) {
  const { asPath } = useRouter()

  const className = asPath === rest.href
    ? activeClassName
    : ''

  return (
    <Link {...rest}>
      { cloneElement(children, {
        className
      }) }
    </Link>
  )
}

// 