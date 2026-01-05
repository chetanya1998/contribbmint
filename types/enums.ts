export const Role = {
    CONTRIBUTOR: 'CONTRIBUTOR',
    MAINTAINER: 'MAINTAINER',
    SPONSOR: 'SPONSOR',
    ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ProjectStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const MemberRole = {
    OWNER: 'OWNER',
    MAINTAINER: 'MAINTAINER',
    CONTRIBUTOR: 'CONTRIBUTOR',
} as const;

export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const ContributionEventType = {
    PR_MERGED: 'PR_MERGED',
    ISSUE_CLOSED: 'ISSUE_CLOSED',
    REVIEW_APPROVED: 'REVIEW_APPROVED',
} as const;

export type ContributionEventType = (typeof ContributionEventType)[keyof typeof ContributionEventType];
