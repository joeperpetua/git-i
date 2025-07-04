#!/usr/bin/env node

import { Command } from 'commander'
import start from './handlers/start.js'
import add from './handlers/add.js'
import commit from './handlers/commit.js'
import push from './handlers/push.js'
import restore from './handlers/restore.js'
import { branchDelete } from './handlers/branch.js'

const program = new Command()

program
  .name('git-i')
  .description('interactive git wrapper')
  .version('0.1.0')

program
  .command('start', { isDefault: true })
  .description('start interactive session')
  .action(start)

program
  .command('add')
  .description('stage files for commit')
  .action(add)

program
  .command('restore')
  .description('discard changes or unstage files')
  .action(restore)

program
  .command('branch delete')
  .description('interactive branch management')
  .action(branchDelete)

program
  .command('commit')
  .option('--amend', 'amend previous commit')
  .description('interactive commit')
  .action(({ amend }) => commit({ amend }))

program
  .command('push')
  .option('--force', 'force push to remote')
  .description('interactive push')
  .action(({ force }) => push({ force }))

program.parse(process.argv)