import { select } from "@inquirer/prompts"
import { execa } from "execa"
import { handleEnd } from "../utils.js"
import { catchExecError, catchInputError } from "./errors.js"

const push = async ({ interactive, force }: { interactive?: boolean, force?: boolean }) => {
  console.log('\n')
  try {
    const remotesResult = await execa('git', ['remote'])
    const remotes = remotesResult.stdout.split('\n').filter(line => line.trim() !== '')

    const branchesResult = await execa('git', ['branch'])
    const currentBranchResult = await execa('git', ['branch', '--show-current'])
    const branches = branchesResult.stdout.split('\n').map(line => line.replace('*', '').trim())
    const currentBranch = currentBranchResult.stdout.trim()

    if (remotes.length === 0) {
      console.log('No remotes found. Aborting.')
      process.exit(0)
    }

    if (branches.length === 0) {
      console.log('No branches found. Aborting.')
      process.exit(0)
    }

    const selectedRemote = await select({
      message: `Select remote to${force ? ' force ' : ' '}push to:`,
      choices: remotes.map(remote => ({ name: remote, value: remote }))
    }).catch(catchInputError)

    const selectedBranch = await select({
      message: `Select branch to${force ? ' force ' : ' '}push:`,
      choices: branches.map(branch => ({ name: branch, value: branch, default: branch === currentBranch }))
    }).catch(catchInputError)

    if (!selectedRemote || !selectedBranch) {
      console.log('Aborting push.')
      process.exit(0)
    }

    const args = ['push', selectedRemote, selectedBranch]
    if (force) args.push('--force')

    const result = await execa('git', args)
    handleEnd(result, interactive)
  }
  catch (err: any) {
    catchExecError(err)
  }
}

export default push;