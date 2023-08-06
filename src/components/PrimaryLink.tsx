import Link from "next/link";

export function PrimaryLink(
  props: React.ComponentPropsWithoutRef<"a"> & { href: string }
) {
  return (
    <Link className="rounded hover:text-cyan-500" {...props}>
      {props.children}
    </Link>
  );
}
