import minimist from 'minimist'
import esbuild from 'esbuild'
import glob from 'glob'
import { clean } from 'esbuild-plugin-clean'
import type { BuildOptions } from 'esbuild'

const args = minimist(process.argv.splice(2))
const watch = args.watch as boolean

const baseOptions: BuildOptions = {
  watch: watch
    ? {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error)
          else console.log('watch build succeeded:', result)
        },
      }
    : false,
  // entryPoints: ['./packages/create-app/index.js', './packages/lv/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  external: ['@lvjiaxuan/create-app', '@lvjiaxuan/lv'],
}

const getConfigByPath = (path: string) => {
  const entryPoints = [path + 'index.js']
  path.includes('create-app') && entryPoints.push(path + 'create.js')

  return {
    entryPoints,
    outdir: path + 'dist',
    plugins: [
      clean({
        patterns: [path + 'dist'],
      }),
    ],
  }
}

const packages = glob.sync('packages/*/') as string[]

packages.forEach(path => {
  // cjs
  esbuild.build({
    ...baseOptions,
    ...getConfigByPath(path),
  })

  // esm
  esbuild.build({
    ...baseOptions,
    ...getConfigByPath(path),
    splitting: true,
    format: 'esm',
    outExtension: { '.js': '.mjs' },
  })
})
