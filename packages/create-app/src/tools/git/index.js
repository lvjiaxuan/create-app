import path from 'path'
import spawn from 'cross-spawn'
import copy from './../../utils/copy'
import { spinnerAll } from './../../utils/global'

export default async targetPath => {
  spinnerAll.start('git')
  copy(path.join(__dirname, '_gitignore'), path.join(targetPath, '.gitignore'))
  return {
    cliFun() {
      const gitChild = spawn('git status', { stdio: 'pipe', cwd: targetPath })
      return new Promise(resolve => {
        gitChild.on('close', code => {
          if (code == 0) {
            spinnerAll.info('git repo existed')
            resolve()
          }
        })
        gitChild.stderr.on('data', () => {
          spawn('git init', { stdio: 'pipe', cwd: targetPath }).on('close', code => {
            if (code == 0) {
              resolve()
            }
          })
        })
      }).then(() => spinnerAll.succeed('git'))
    },
  }
}
