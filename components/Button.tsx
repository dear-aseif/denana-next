'use client';

/*
 * Button
 * Reusable button/link matching the prototype's .btn variants exactly.
 * - variant: primary (default) | secondary | ghost  -> maps to .btn / .secondary / .ghost
 * - size: default | small | tiny                    -> maps to '' / .small / .tiny
 * - href: when provided, renders a Next <Link> (internal) or <a> (external/hash)
 *   styled as a button, mirroring the prototype's <a class="btn"> elements.
 */
import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'default' | 'small' | 'tiny';

function classes(variant: Variant, size: Size, extra?: string): string {
  const parts = ['btn'];
  if (variant === 'secondary') parts.push('secondary');
  if (variant === 'ghost') parts.push('ghost');
  if (size === 'small') parts.push('small');
  if (size === 'tiny') parts.push('tiny');
  if (extra) parts.push(extra);
  return parts.join(' ');
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'default', className, children } = props;
  const cls = classes(variant, size, className);

  if ('href' in props && props.href !== undefined) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    const isInternal = href.startsWith('/');
    if (isInternal) {
      return (
        <Link href={href} className={cls} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } =
    props as ButtonAsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
