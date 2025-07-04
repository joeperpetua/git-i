import { checkbox } from "@inquirer/prompts"
import { execa } from "execa"
import { handleEnd } from "../utils.js"
import { catchCheckboxError, catchExecError } from "./errors.js"

const branchDelete = async ({ interactive }: { interactive?: boolean }) => {
  try {
    const branchesResult = await execa('git', ['branch'])

    const branches = branchesResult.stdout
      .split('\n')
      .filter(line => !line.startsWith('*'))
      .map(line => line.replace('*', '').trim())

    const selectedBranches = await checkbox({
      message: 'Select branches to delete:',
      choices: branches.map(branch => ({ name: branch, value: branch })),
      loop: false
    }).catch(catchCheckboxError)

    if (!selectedBranches || selectedBranches.length === 0)
      process.exit(0)

    const result = await execa('git', ['branch', '-d', ...selectedBranches])
    handleEnd(result, interactive)
  } catch (err: any) {
    catchExecError(err)
  }
}

export { branchDelete };