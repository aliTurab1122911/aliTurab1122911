import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canManageProjects } from "@/lib/permissions";
import { listProjects } from "@/lib/projects";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const projects = await listProjects();
  const user = await getCurrentUser();

  return (
    <main className="grid">
      <section className="card">
        <h1>Projects</h1>
        {params.error ? <div className="alert">Please fill all required fields.</div> : null}
        <div className="grid">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <strong>{project.key} — {project.name}</strong>
              <p>{project.description}</p>
              <Link href={`/projects/${project.id}`}>Open board</Link>
            </div>
          ))}
        </div>
      </section>

      {user && canManageProjects(user) ? (
        <section className="card">
          <h2>Create Project</h2>
          <form action="/api/projects" method="post">
            <label>Name</label>
            <input name="name" required />
            <label>Key</label>
            <input name="key" required maxLength={8} />
            <label>Description</label>
            <textarea name="description" rows={3} />
            <div style={{ marginTop: ".8rem" }}><button type="submit">Create Project</button></div>
          </form>
        </section>
      ) : null}
    </main>
  );
}
