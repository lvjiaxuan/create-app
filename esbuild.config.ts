import esbuild from 'esbuild'
import type { BuildOptions } from 'esbuild'

const argvs = process.argv.splice(2)
const watch = argvs.includes('--watch')

const baseOptions: BuildOptions = {
  watch: watch
    ? {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error)
          else console.log('watch build succeeded:', result)
        },
      }
    : false,
  entryPoints: ['./create.js'],
  bundle: true,
  platform: 'node',
  target: 'node16',
}

esbuild.build({
  ...baseOptions,
  outdir: 'dist/cjs',
})

esbuild.build({
  ...baseOptions,
  outdir: 'dist/esm',
  splitting: true,
  format: 'esm',
  outExtension: { '.js': '.mjs' },
})
