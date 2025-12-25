export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/import', '/api/projects/:path*', '/onboarding'],
};
