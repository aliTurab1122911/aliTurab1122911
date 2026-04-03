import fs from "fs/promises";
import path from "path";

async function write(file: string, content: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, "utf8");
}

async function main() {
  const now = new Date().toISOString();

  const users = [
    "id,username,email,password_hash,full_name,role,avatar,created_at,status",
    `user_admin,admin,admin@example.com,admin12345,Admin User,admin,AU,${now},active`,
    `user_ali,ali,ali@example.com,ali12345,Ali Turab,member,AT,${now},active`,
    `user_sara,sara,sara@example.com,sara12345,Sara Khan,member,SK,${now},active`
  ].join("\n");

  const projects = [
    "id,name,key,description,created_by,created_at,status",
    `proj_alpha,Alpha Project,ALPHA,Internal launch tasks,user_admin,${now},active`
  ].join("\n");

  const tasks = [
    "id,project_id,title,description,status,priority,assignee_id,reporter_id,due_date,start_date,tags,created_at,updated_at",
    `task_demo,proj_alpha,Create kickoff board,Seed first backlog items,To Do,Medium,user_member,user_admin,2026-04-10,2026-04-02,\"setup,onboard\",${now},${now}`
  ].join("\n");

  const activity = [
    "id,task_id,user_id,action,old_value,new_value,created_at",
    `act_demo,task_demo,user_admin,created,,initial seed,${now}`
  ].join("\n");

  await write(path.join(process.cwd(), "data/users.csv"), users + "\n");
  await write(path.join(process.cwd(), "data/projects.csv"), projects + "\n");
  await write(path.join(process.cwd(), "data/tasks.csv"), tasks + "\n");
  await write(path.join(process.cwd(), "data/activity.csv"), activity + "\n");

  console.log("Seeded CSV data files.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
