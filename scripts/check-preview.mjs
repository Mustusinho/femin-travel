import { previewReadinessErrors } from '../lib/preview-readiness.mjs'
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} })
const errors = previewReadinessErrors(process.env)
if (errors.length) {
  console.error('Live preview configuration:\n' + errors.map((error) => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(
    'Preview configuration shape is complete. Provider ownership, migrations, RLS and live delivery still require verification. Checklist mode has not been changed.'
  )
}
