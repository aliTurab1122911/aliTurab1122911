import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;

  return (
    <main className="grid grid-2">
      <section className="card">
        <h1>Profile</h1>
        {params.ok ? <div className="alert">Updated successfully.</div> : null}
        {params.error ? <div className="alert">Could not update; check inputs.</div> : null}
        <form action="/api/profile" method="post">
          <input type="hidden" name="intent" value="profile" />
          <label>Username</label>
          <input defaultValue={user?.username} disabled />
          <label>Full Name</label>
          <input name="full_name" defaultValue={user?.full_name} required />
          <label>Avatar/Initials</label>
          <input name="avatar" defaultValue={user?.avatar} />
          <div style={{ marginTop: ".8rem" }}><button type="submit">Save Profile</button></div>
        </form>
      </section>

      <section className="card">
        <h2>Change Password</h2>
        <form action="/api/profile" method="post">
          <input type="hidden" name="intent" value="password" />
          <label>New password (8+ chars)</label>
          <input type="password" name="password" required minLength={8} />
          <div style={{ marginTop: ".8rem" }}><button type="submit">Update Password</button></div>
        </form>
      </section>
    </main>
  );
}
