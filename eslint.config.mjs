import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  { ignores: ['public/sw.js', 'public/swe-worker-*.js', 'test-results/**', 'playwright-report/**'] },
  ...nextVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]

export default eslintConfig
