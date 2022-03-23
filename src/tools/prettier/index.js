import path from 'path'
import copy from './../../utils/copy'
import { spinnerAll, getLatestVersion } from './../../utils/global'

export default async targetPath => {
  spinnerAll.start('prettier')
  copy(path.join(__dirname, '.prettierrc.js'), path.join(targetPath, '.prettierrc.js'))
  copy(path.join(__dirname, '.prettierignore'), path.join(targetPath, '.prettierignore'))
  const prettierVersion = await getLatestVersion('prettier')
  spinnerAll.succeed('prettier')

  return {
    pkg: {
      'lint-staged': {
        '*': 'prettier -w -u',
      },
      devDependencies: {
        prettier: `^${prettierVersion}`,
      },
    },
  }
}
