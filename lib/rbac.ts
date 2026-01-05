import { Role } from '@/types/enums';

export function canManageProjects(role?: Role | string | null) {
  return role === 'ADMIN' || role === 'MAINTAINER';
}

export function isSponsor(role?: Role | string | null) {
  return role === 'SPONSOR';
}

export function isAdmin(role?: Role | string | null) {
  return role === 'ADMIN';
}
