import path from 'path'
import copy from './../../utils/copy'
import { spinnerAll, getLatestVersion } from './../../utils/global'

export default async targetPath => {
  spinnerAll.start('commitizen')
  copy(path.join(__dirname, '.cz-simple.js'), path.join(targetPath, '.cz-simple.js'))

  const commitizenVersion = await getLatestVersion('commitizen')

  spinnerAll.succeed('commitizen')

  return {
    pkg: {
      scripts: {
        cz: 'git-cz',
      },
      config: {
        commitizen: {
          path: './.cz-simple',
        },
      },
      devDependencies: {
        commitizen: `^${commitizenVersion}`,
      },
    },
  }
}
