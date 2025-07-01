import { checkbox } from "@inquirer/prompts"
import { execa } from "execa"
import { catchCheckboxError, catchExecError } from "./errors.js"

const add = async () => {
  try {
    const result = await execa('git', ['status', '--short'])
    const unstagedFiles = result.stdout
      .split('\n')
      .filter(line => line.startsWith('??'))
      .map(line => line.replace('??', '').trim())

    const modifiedFiles = result.stdout
      .split('\n')
      .filter(line => line.startsWith('M') || line.startsWith('AM'))
      .map(line => line.replace('AM', '').replace('M', '').trim())

    const selectedFiles = await checkbox({
      message: 'Select files to add:',
      choices: [
        ...unstagedFiles.map(file => ({ name: file, value: file })),
        ...modifiedFiles.map(file => ({ name: file, value: file }))
      ],
      loop: false
    }).catch(catchCheckboxError)

    if (selectedFiles.length <= 0)
      return

    await execa('git', ['add', ...selectedFiles])

    console.log('Sucessfully added files.')
  } catch (err: any) {
    catchExecError(err)
  }
}

export {
  add
}