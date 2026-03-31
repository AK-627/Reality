import { cookies } from "next/headers";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth")?.value;
  return token === process.env.ADMIN_PASSWORD;
}
