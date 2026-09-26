export type ClassValue = string | false | null | undefined;

/** Joins truthy class names. Tiny on purpose — we don't need `clsx`'s object syntax. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
