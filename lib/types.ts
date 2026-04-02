export type Role = "admin" | "member";
export type UserStatus = "active" | "inactive";
export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: Role;
  avatar: string;
  created_at: string;
  status: UserStatus;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  created_by: string;
  created_at: string;
  status: "active" | "archived";
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string;
  reporter_id: string;
  due_date: string;
  start_date: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  old_value: string;
  new_value: string;
  created_at: string;
}
