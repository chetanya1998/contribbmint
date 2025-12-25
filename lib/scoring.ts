import { ContributionEventType } from '@prisma/client';

export function scoreEvent(eventType: ContributionEventType) {
  switch (eventType) {
    case 'PR_MERGED':
      return 10;
    case 'ISSUE_CLOSED':
      return 2;
    case 'REVIEW_APPROVED':
      return 3;
    default:
      return 0;
  }
}
