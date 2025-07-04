#!/usr/bin/env node

import { Command } from 'commander'
import { add, branchDelete, commit, restore, start } from './handlers/actions.js';

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
  .description('interactive commit')
  .action(commit)

program
  .command('push')
  .description('interactive push')
  .action(commit)

program.parse(process.argv)