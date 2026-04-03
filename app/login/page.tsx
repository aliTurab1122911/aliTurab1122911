import { ensureDataFiles } from "@/lib/bootstrap";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureDataFiles();
  const params = await searchParams;

  return (
    <main className="login-shell">
      <section className="card">
        <h1>Main Login</h1>
        {params.error ? <div className="alert">Invalid credentials</div> : null}
        <form action="/api/auth/login" method="post">
          <label>Username or Email</label>
          <input name="identifier" required />
          <label>Password</label>
          <input type="password" name="password" required />
          <div style={{ marginTop: ".8rem" }}>
            <button type="submit" className="button-34">Sign in</button>
          </div>
        </form>
        <small className="muted">Try: admin/admin12345, ali/ali12345, sara/sara12345</small>
      </section>

      <section className="card">
        <h1>Guest Login</h1>
        <p className="muted">Guest mode is temporary. Data is attached to this session and cleared on logout.</p>
        <form action="/api/auth/guest" method="post">
          <button type="submit" className="button-34">Continue as Guest</button>
        </form>
      </section>
    </main>
  );
}
