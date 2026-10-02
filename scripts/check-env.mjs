import { configErrors } from '../lib/config.mjs'
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} })
const errors = configErrors({ ...process.env, NODE_ENV: 'production' })
if (errors.length) {
  console.error('FeminTravel configuration:\n' + errors.map((e) => `- ${e}`).join('\n'))
  process.exitCode = 1
} else
  console.log(
    'Environment configuration is valid; disabled integrations will be hidden or downgraded.'
  )
