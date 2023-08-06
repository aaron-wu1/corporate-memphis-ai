import Link from "next/link";
import { PrimaryLink } from "./PrimaryLink";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./Button";
import { useBuyCredits } from "~/hooks/useBuyCredits";

export function Header() {
  const session = useSession();
  const isLoggedIn = !!session.data;
  const { buyCredits } = useBuyCredits();

  return (
    <header className="container mx-auto flex h-40 items-center justify-between px-4 dark:bg-gray-800">
      <PrimaryLink href="/" className="hover:text-cyan-500">
        Image Generator
      </PrimaryLink>
      <ul>
        <li>
          <Link href="/generate">Generate</Link>
        </li>
      </ul>
      <ul className="flex gap-4">
        {isLoggedIn && (
          <>
            <li>
              <Button
                onClick={() => {
                  buyCredits().catch(console.error);
                }}
              >
                Buy Credits
              </Button>
            </li>
            <li>
              <Button
                variant="primary"
                onClick={() => {
                  signOut().catch(console.error);
                }}
              >
                Logout
              </Button>
            </li>
          </>
        )}

        {!isLoggedIn && (
          <li>
            <Button
              variant="secondary"
              onClick={() => {
                signIn().catch(console.error);
              }}
            >
              Login
            </Button>
          </li>
        )}
      </ul>
    </header>
  );
}
