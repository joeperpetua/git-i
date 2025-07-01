#!/usr/bin/env node

import { Command } from 'commander'
import { add, branchDelete, restore } from './handlers/actions.js';

const program = new Command()

program
  .name('git-i')
  .description('Interactive git wrapper')
  .version('0.1.0')

program
  .command('add')
  .description('Stage files for commit')
  .action(add)

program
  .command('restore')
  .description('Discard changes or unstage files')
  .action(restore)

program
  .command('branch delete')
  .description('Interactive branch management')
  .action(branchDelete)

program.parse(process.argv)