import { createHash, randomUUID } from "crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createMessageId(): string {
  return randomUUID();
}
