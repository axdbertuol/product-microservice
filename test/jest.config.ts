import type { Config } from 'jest'
const config: Config = {
  // Other Jest configuration options...

  // Setup files to run before all tests
  setupFilesAfterEnv: ['./setup.ts'],
}
export default config
