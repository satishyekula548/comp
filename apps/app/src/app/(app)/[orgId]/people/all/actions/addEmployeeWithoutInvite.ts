'use server';

import { auth } from '@/utils/auth';
import { sendInviteMemberEmail } from '@comp/email/lib/invite-member';
import { db } from '@db';
import { headers } from 'next/headers';

//export const sendInvitationEmailToExistingMember = async ({
export const addEmployeeWithoutInvite = async ({
  email,
  organizationId,
  roles,
}: {
  email: string;
  organizationId: string;
  roles: string[];
}) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.session) {
      throw new Error('Authentication required.');
    }

    const currentUserId = session.session.userId;

    const currentUserMember = await db.member.findFirst({
      where: {
        organizationId: organizationId,
        userId: currentUserId,
        deactivated: false,
      },
    });

    if (
      !currentUserMember ||
      (!currentUserMember.role.includes('admin') &&
        !currentUserMember.role.includes('owner'))
    ) {
      throw new Error("You don't have permission to send invitations.");
    }

    // Get organization name
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!organization) {
      throw new Error('Organization not found.');
    }

    // Create invitation record
    const invitation = await db.invitation.create({
      data: {
        email: email.toLowerCase(),
        organizationId,
        role: roles.length === 1 ? roles[0] : roles.join(','),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inviterId: currentUserId,
      },
    });

    // ✅ PRODUCTION-SAFE INVITE LINK GENERATION
    const appUrl = process.env.APP_URL;

    if (!appUrl) {
      throw new Error('APP_URL is not configured in environment variables.');
    }

    const inviteLink = `${appUrl}/invite/${invitation.id}`;

    // Send invitation email
    await sendInviteMemberEmail({
      inviteeEmail: email.toLowerCase(),
      inviteLink,
      organizationName: organization.name,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};
