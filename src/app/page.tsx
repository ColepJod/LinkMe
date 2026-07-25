import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
          LinkMe
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Your digital identity, one link away.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
