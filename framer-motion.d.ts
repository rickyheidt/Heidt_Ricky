// Type stubs for framer-motion (used when dist/index.d.ts is not bundled)
declare module "framer-motion" {
  import * as React from "react";

  export type Variant = Record<string, unknown>;
  export type Variants = Record<string, Variant>;
  export type MotionValue<T = unknown> = { get: () => T; set: (v: T) => void };

  export type AnimatePresenceProps = {
    children?: React.ReactNode;
    initial?: boolean;
    exitBeforeEnter?: boolean;
    onExitComplete?: () => void;
    mode?: "sync" | "wait" | "popLayout";
  };

  export type MotionProps = {
    initial?: Record<string, unknown> | string | boolean;
    animate?: Record<string, unknown> | string;
    exit?: Record<string, unknown> | string;
    transition?: Record<string, unknown>;
    variants?: Variants;
    whileHover?: Record<string, unknown> | string;
    whileTap?: Record<string, unknown> | string;
    whileFocus?: Record<string, unknown> | string;
    whileDrag?: Record<string, unknown> | string;
    whileInView?: Record<string, unknown> | string;
    layout?: boolean | string;
    layoutId?: string;
    onAnimationComplete?: () => void;
    onAnimationStart?: () => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler;
    onPointerDown?: React.PointerEventHandler;
    ref?: React.Ref<unknown>;
    key?: string | number;
    drag?: boolean | "x" | "y";
    dragConstraints?: Record<string, unknown>;
    dragElastic?: number;
    onDrag?: (event: PointerEvent, info: unknown) => void;
    onDragEnd?: (event: PointerEvent, info: unknown) => void;
    custom?: unknown;
    as?: React.ElementType;
    id?: string;
    role?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    tabIndex?: number;
    [key: string]: unknown;
  };

  type HTMLMotionComponents = {
    [K in keyof JSX.IntrinsicElements]: React.ForwardRefExoticComponent<
      MotionProps & JSX.IntrinsicElements[K]
    >;
  };

  export const motion: HTMLMotionComponents & {
    create: <T extends React.ElementType>(
      Component: T,
      options?: Record<string, unknown>
    ) => React.ForwardRefExoticComponent<MotionProps & React.ComponentProps<T>>;
  };

  export const AnimatePresence: React.FC<AnimatePresenceProps>;

  export function useMotionValue<T>(initial: T): MotionValue<T>;
  export function useTransform<T>(
    value: MotionValue<T>,
    input: T[],
    output: unknown[]
  ): MotionValue;
  export function useSpring(value: number | MotionValue, config?: Record<string, unknown>): MotionValue<number>;
  export function useAnimation(): {
    start: (definition: Record<string, unknown>) => Promise<void>;
    stop: () => void;
    set: (definition: Record<string, unknown>) => void;
  };
  export function useCycle<T>(...values: T[]): [T, (i?: number) => void];
  export function useScroll(options?: Record<string, unknown>): {
    scrollX: MotionValue<number>;
    scrollY: MotionValue<number>;
    scrollXProgress: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
  };
  export function useInView(ref: React.RefObject<Element>, options?: Record<string, unknown>): boolean;
  export function useReducedMotion(): boolean;
  export function usePresence(): [boolean, () => void];
  export function useIsPresent(): boolean;
}
