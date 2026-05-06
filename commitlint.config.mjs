// Conventional Commits enforced via the lefthook commit-msg hook.
// Allowed types match the recent git history (feat, fix, refactor, chore, …).
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'body-max-line-length': [0],
  },
}
