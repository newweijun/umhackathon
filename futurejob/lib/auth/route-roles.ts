import { type UserRole, isUserRole } from "@/lib/domain/enums";

const ROLE_ROUTE_PREFIXES: Array<{ prefix: string; role: UserRole }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/company", role: "company" },
];

export function getRequiredRoleForPath(pathname: string): UserRole | null {
  const match = ROLE_ROUTE_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.role ?? null;
}

export function canAccessPath(pathname: string, role: unknown): boolean {
  const requiredRole = getRequiredRoleForPath(pathname);
  if (!requiredRole) {
    return true;
  }

  return isUserRole(role) && role === requiredRole;
}
