"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, loading } = useUser();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg tracking-tight">
          TonePalette
        </Link>
        <nav className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">ダッシュボード</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">ログイン</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">無料で始める</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
