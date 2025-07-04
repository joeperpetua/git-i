import { checkbox } from "@inquirer/prompts"
import { execa } from "execa"
import { catchCheckboxError, catchExecError } from "./errors.js"
import start from "./start.js"

const add = async ({ interactive }: { interactive?: boolean }) => {
  console.log('\n')
  try {
    const { stdout } = await execa('git', ['status', '--short'])
    if (!stdout) {
      console.log('No changes to add. Working tree is clean.')
      process.exit(0)
    }

    const addableFiles = stdout
      .split('\n')
      .filter(line => {
        if (line.trim() === '') return false
        const status = line.substring(0, 2)
        // Untracked files are always addable.
        if (status === '??') return true
        // For tracked files, the second character indicates work-tree status.
        // A non-space character means there are changes to be staged.
        // This covers Modified, Deleted, Type-changed, and unmerged files.
        if (status[1] && status[1].trim() !== '') return true
        return false
      })
      .map(line => {
        // For renames/copies, the format is `XY oldpath -> newpath`
        // We are interested in the new path.
        if (line.includes('->')) {
          return { status: line.substring(0, 2), path: line.split('->')[1].trim() }
        }
        // For all other files, the path starts at the 4th character.
        return { status: line.substring(0, 2), path: line.substring(3).trim() }
      })

    // De-duplicate files by their path. Using a Map is a clean way to
    // ensure each file path is represented only once, taking the first
    // status encountered. This correctly handles cases like a manual rename
    // which git sees as a deletion and an untracked file.
    const uniqueFiles = Array.from(
      addableFiles.reduce((map, file) => map.set(file.path, file), new Map()).values()
    )

    if (uniqueFiles.length === 0) {
      console.log('No unstaged changes to add.')
      process.exit(0)
    }

    const selectedFiles = await checkbox({
      message: 'Select files to add:',
      choices: uniqueFiles.map(file => ({ name: `${file.status} ${file.path}`, value: file.path })),
      loop: false
    }).catch(catchCheckboxError)

    if (!selectedFiles || selectedFiles.length === 0) {
      console.log('No files selected. Aborting.')
      process.exit(0)
    }

    await execa('git', ['add', ...selectedFiles])

    console.log('Successfully added files.')
  } catch (err: any) {
    catchExecError(err)
  }

  if (interactive)
    start();
}

export default add;