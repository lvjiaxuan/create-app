import spawn from 'cross-spawn'
import { spinnerAll, getLatestVersion } from './../../utils/global'

export default async targetPath => {
  spinnerAll.start('husky')

  return {
    pkg: {
      devDependencies: {
        husky: `^${await getLatestVersion('husky')}`,
      },
    },
    cliFun() {
      return new Promise(resolve => {
        const installSpawn = spawn('npx husky install', { stdio: 'pipe', cwd: targetPath })
        installSpawn.on('close', code => {
          if (code == 0) {
            spinnerAll.succeed('husky')
            resolve()
          }
        })
      })
    },
  }
}