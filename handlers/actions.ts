import { checkbox, input, select, Separator } from "@inquirer/prompts"
import { execa } from "execa"
import { catchCheckboxError, catchExecError, catchInputError } from "./errors.js"

const interactiveChoices = [
  { name: 'Add files', value: 'add', callback: async () => await add({ interactive: true }) },
  { name: 'Restore changes', value: 'restore', callback: async () => await restore({ interactive: true }) },
  { name: 'Delete branches', value: 'branch delete', callback: async () => await branchDelete({ interactive: true }) },
  { name: 'Commit changes', value: 'commit', callback: async () => await commit({ interactive: true }) },
  { name: 'Amend previous commit', value: 'commit --amend', callback: async () => await commit({ interactive: true, amend: true }) },
  { name: 'Push to remote', value: 'push', callback: async () => await push({ interactive: true }) },
  { name: 'Force push to remote', value: 'push --force', callback: async () => await push({ interactive: true, force: true }) },
]

const start = async () => {
  const action = await select({
    message: 'What would you like to do?',
    choices: [
      ...interactiveChoices,
      new Separator(),
      { name: 'Exit', value: 'exit' },
    ],
    loop: false
  }).catch(catchInputError)

  if (!action) {
    console.log('Exiting git-i...')
    process.exit(0)
  }

  if (action === 'exit') {
    console.log('Exiting git-i...')
    process.exit(0)
  }

  const foundChoice = interactiveChoices.find(choice => choice.value === action)
  if (foundChoice) {
    await foundChoice.callback()
  } else {
    console.log('Invalid action. Please try again.')
  }
}

const add = async ({ interactive }: { interactive?: boolean }) => {
  console.clear()
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

const restore = async ({ interactive }: { interactive?: boolean }) => {
  console.clear()
  try {
    const { stdout } = await execa('git', ['status', '--short'])
    if (!stdout) {
      console.log('No changes to restore. Working tree is clean.')
      process.exit(0)
    }

    const lines = stdout.split('\n').filter(line => line.trim() !== '')

    const changesToSelect = lines.flatMap(line => {
      const changes: { path: string; label: string; type: 'staged' | 'worktree' }[] = []
      const status = line.substring(0, 2)
      const pathPart = line.substring(3)
      const path = pathPart.includes('->') ? pathPart.split('->')[1].trim() : pathPart.trim()

      // Staged changes (index status is in the first character)
      if (status[0]?.trim() && status[0] !== '?')
        changes.push({ path, label: `${status} ${path}`, type: 'staged' })

      // Unstaged changes (work-tree status is in the second character)
      if (status[1]?.trim())
        changes.push({ path, label: `${status} ${path}`, type: 'worktree' })

      return changes
    })

    if (changesToSelect.length === 0) {
      console.log('No staged or unstaged changes to restore.')
      process.exit(0)
    }

    const stagedChangesChoices = changesToSelect
      .filter(change => change.type === 'staged')
      .map(change => ({ name: change.label, value: { path: change.path, type: change.type } }));

    const unstagedChangesChoices = changesToSelect
      .filter(change => change.type === 'worktree')
      .map(change => ({ name: change.label, value: { path: change.path, type: change.type } }));

    const selectedChanges = await checkbox({
      message: 'Select changes to restore (unstage or discard):',
      choices: [
        { name: `Staged changes (${stagedChangesChoices.length})`, value: { path: '', type: '' }, disabled: ' ' },
        ...stagedChangesChoices,
        new Separator(),
        { name: `Unstaged changes (${unstagedChangesChoices.length})`, value: { path: '', type: '' }, disabled: ' ' },
        ...unstagedChangesChoices
      ],
      loop: false,
      pageSize: 10,
    }).catch(catchCheckboxError)

    if (!selectedChanges || selectedChanges.length === 0) {
      console.log('No changes selected. Aborting.')
      process.exit(0)
    }

    const toUnstage = selectedChanges.filter(change => change.type === 'staged').map(change => change.path)
    const toDiscard = selectedChanges.filter(change => change.type === 'worktree').map(change => change.path)

    if (toUnstage.length > 0) {
      await execa('git', ['restore', '--staged', ...new Set(toUnstage)])
      console.log('Successfully unstaged files.')
    }

    if (toDiscard.length > 0) {
      await execa('git', ['restore', ...new Set(toDiscard)])
      console.log('Successfully discarded changes from working directory.')
    }
  } catch (err: any) {
    catchExecError(err)
  }

  if (interactive)
    start();
}

const branchDelete = async ({ interactive }: { interactive?: boolean }) => {
  console.clear()
  try {
    const result = await execa('git', ['branch'])

    const branches = result.stdout
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

    await execa('git', ['branch', '-d', ...selectedBranches])

    console.log('Sucessfully deleted branches.')
  } catch (err: any) {
    catchExecError(err)
  }

  if (interactive)
    start();
}

const commit = async ({ interactive, amend }: { interactive?: boolean, amend?: boolean }) => {
  console.clear()
  try {
    const commitMessage = await input({ message: 'Commit message:', required: true }).catch(catchInputError);
    if (!commitMessage) return; // User cancelled the prompt

    const commitDescription = await input({ message: 'Commit description:' }).catch(catchInputError);

    const args = ['commit', '-m', commitMessage];
    if (commitDescription) args.push('-m', commitDescription);
    if (amend) args.push('--amend');
    
    const result = await execa('git', args);

    if (result.stdout) {
      console.log(result.stdout)
      console.log('\n')
    }

    console.log('Successfully committed changes.');
  }
  catch (err: any) {
    catchExecError(err)
  }

  if (interactive)
    start();
}

const push = async ({ interactive, force }: { interactive?: boolean, force?: boolean }) => {
  console.clear()
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

    const result = await execa('git', ['push', selectedRemote, selectedBranch, force ? '--force' : ''])

    if (result.stderr) {
      console.log(result.stderr)
      console.log('\n')
    }

    if (result.stdout) {
      console.log(result.stdout)
      console.log('\n')
      console.log('Successfully pushed to remote.');
    }

    if (interactive)
      start();
  }
  catch (err: any) {
    catchExecError(err)
  }
}

export {
  start,
  add,
  restore,
  branchDelete,
  commit,
  push
}