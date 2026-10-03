// Demo mode is an auth bypass (POST /auth/demo mints an admin session), so
// it is only auto-on when NODE_ENV is *explicitly* 'development' — which
// `nuxt dev` sets. An unset NODE_ENV (e.g. a bare `node .output/server/
// index.mjs`) counts as production. Pass the RAW process.env.NODE_ENV,
// never a schema-defaulted value.
//   flag 'true'  → on, 'false' → off, unset → on only in development.
export function resolveDemoMode(flag: string | undefined, nodeEnv: string | undefined): boolean {
  return flag === 'true' || (flag !== 'false' && nodeEnv === 'development')
}
