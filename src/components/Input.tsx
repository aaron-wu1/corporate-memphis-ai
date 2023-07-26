import { text } from "stream/consumers";

export function Input(props: React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      {...props}
      type="text"
      className="rounded border-gray-800 px-4 py-2 dark:text-gray-800"
    ></input>
  );
}
