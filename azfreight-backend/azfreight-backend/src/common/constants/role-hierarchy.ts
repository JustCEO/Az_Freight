const ROLE_LEVELS: Record<string, number> = {
  superadmin: 100,
  director: 80,
  admin: 70,
  hr: 60,
  manager: 50,
  logistics_agent: 40,
  dispatcher: 40,
  warehouse_manager: 40,
  accountant: 30,
  client: 10,
};

export function getRoleLevel(role: string): number {
  return ROLE_LEVELS[role] ?? 0;
}

export function canManageRole(actorRole: string, targetRole: string): boolean {
  return getRoleLevel(actorRole) > getRoleLevel(targetRole);
}

export function getCreatableRoles(actorRole: string): string[] {
  const actorLevel = getRoleLevel(actorRole);
  return Object.entries(ROLE_LEVELS)
    .filter(([role, level]) => level < actorLevel && role !== 'superadmin')
    .map(([role]) => role);
}
