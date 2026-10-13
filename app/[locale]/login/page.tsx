import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage(props: PageProps<"/[locale]/login">) {
  const { locale } = await props.params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center border border-line-strong bg-inverse font-mono text-sm font-bold text-inverse-fg">
            A
          </span>
          <span className="text-sm font-medium tracking-wide text-fg-muted">
            {locale.toUpperCase()}
          </span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
