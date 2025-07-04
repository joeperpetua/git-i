import { select, Separator } from "@inquirer/prompts"
import { catchInputError } from "./errors.js"
import add from "./add.js"
import commit from "./commit.js"
import push from "./push.js"
import restore from "./restore.js"
import { branchDelete } from "./branch.js"

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
  if (foundChoice) await foundChoice.callback()
}

export default start;