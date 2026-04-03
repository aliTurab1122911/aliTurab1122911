import { ensureDataFiles } from "@/lib/bootstrap";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureDataFiles();
  const params = await searchParams;

  return (
    <main className="card" style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h1>Sign in</h1>
      {params.error ? <div className="alert">Invalid credentials</div> : null}
      <form action="/api/auth/login" method="post">
        <label>Username or Email</label>
        <input name="identifier" required />

        <label>Password</label>
        <input type="password" name="password" required />

        <div style={{ marginTop: ".8rem" }}>
          <button type="submit">Sign in</button>
        </div>
      </form>
      <small className="muted">Seed user: admin / admin12345</small>
    </main>
  );
}
