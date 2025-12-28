"use server";


import { getCurrentUser } from "./users";

export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

/*   const members = await db.query.member.findMany({
    where: eq(member.userId, currentUser.id),
  }); */
  const organizations = ['organization1', 'organization2']; //
  /*   const organizations = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      members.map((m) => m.organizationId),
    ),
  });
 */
  return organizations;
}

export async function getActiveOrganization(userId: string) {
/*   const memberUser = await db.query.member.findFirst({
    where: eq(member.userId, userId),
  });

  if (!memberUser) {
    return null;
  }

  const activeOrganization = await db.query.organization.findFirst({
    where: eq(organization.id, memberUser.organizationId),
  });
 */
  return {id: userId, name: 'Organization 1'}; //
}

export async function getOrganizationBySlug(slug: string) {
  try {
/*     const organizationBySlug = await db.query.organization.findFirst({
      where: eq(organization.slug, slug),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
 */
    return slug;
  } catch (error) {
    console.error(error);
    return null;
  }
}
