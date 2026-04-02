import { PrismaClient, WorkspaceRole } from '@prisma/client';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../packages/shared/src/utils/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create permissions
  const permissionRecords: Record<string, string> = {};
  for (const action of Object.values(PERMISSIONS)) {
    const permission = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action },
    });
    permissionRecords[action] = permission.id;
  }
  console.log(`Created ${Object.keys(permissionRecords).length} permissions`);

  // Create roles and assign permissions
  const roles: WorkspaceRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];
  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const rolePerms = ROLE_PERMISSIONS[roleName] || [];
    for (const action of rolePerms) {
      const permissionId = permissionRecords[action];
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId,
        },
      });
    }
    console.log(`Role ${roleName}: assigned ${rolePerms.length} permissions`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
