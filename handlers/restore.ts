import { checkbox, Separator } from "@inquirer/prompts"
import { execa } from "execa"
import start from "./start.js"
import { catchCheckboxError, catchExecError } from "./errors.js"

const restore = async ({ interactive }: { interactive?: boolean }) => {
  console.log('\n')
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

export default restore;