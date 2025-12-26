"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberQueries = void 0;
const db_1 = require("@trycompai/db");
/**
 * Common database queries for member operations
 */
class MemberQueries {
    /**
     * Standard member selection fields
     */
    static MEMBER_SELECT = {
        id: true,
        organizationId: true,
        userId: true,
        role: true,
        createdAt: true,
        department: true,
        isActive: true,
        fleetDmLabelId: true,
        user: {
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                lastLogin: true,
            },
        },
    };
    /**
     * Get all members for an organization
     */
    static async findAllByOrganization(organizationId) {
        return db_1.db.member.findMany({
            where: { organizationId, deactivated: false },
            select: this.MEMBER_SELECT,
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Find a member by ID within an organization
     */
    static async findByIdInOrganization(memberId, organizationId) {
        return db_1.db.member.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
            select: this.MEMBER_SELECT,
        });
    }
    /**
     * Create a new member
     */
    static async createMember(organizationId, createData) {
        return db_1.db.member.create({
            data: {
                organizationId,
                userId: createData.userId,
                role: createData.role,
                department: createData.department || 'none',
                isActive: createData.isActive ?? true,
                fleetDmLabelId: createData.fleetDmLabelId || null,
            },
            select: this.MEMBER_SELECT,
        });
    }
    /**
     * Update a member by ID
     */
    static async updateMember(memberId, updateData) {
        // Prepare update data with defaults for optional fields
        const updatePayload = { ...updateData };
        // Handle fleetDmLabelId: convert undefined to null for database
        if (updateData.fleetDmLabelId === undefined &&
            'fleetDmLabelId' in updateData) {
            updatePayload.fleetDmLabelId = null;
        }
        return db_1.db.member.update({
            where: { id: memberId },
            data: updatePayload,
            select: this.MEMBER_SELECT,
        });
    }
    /**
     * Get member for deletion (with minimal user info)
     */
    static async findMemberForDeletion(memberId, organizationId) {
        return db_1.db.member.findFirst({
            where: {
                id: memberId,
                organizationId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    /**
     * Delete a member by ID
     */
    static async deleteMember(memberId) {
        await db_1.db.member.delete({
            where: { id: memberId },
        });
    }
    /**
     * Bulk create members for an organization
     */
    static async bulkCreateMembers(organizationId, memberData) {
        // Prepare data for createMany
        const data = memberData.map((member) => ({
            organizationId,
            userId: member.userId,
            role: member.role,
            department: member.department || 'none',
            isActive: member.isActive ?? true,
            fleetDmLabelId: member.fleetDmLabelId || null,
        }));
        // Perform bulk insert
        await db_1.db.member.createMany({
            data,
            skipDuplicates: true, // Prevents error if userId is already a member
        });
        // Fetch the created members for response (by userId, since ids are generated)
        return db_1.db.member.findMany({
            where: {
                organizationId,
                userId: { in: memberData.map((m) => m.userId) },
            },
            select: this.MEMBER_SELECT,
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.MemberQueries = MemberQueries;
