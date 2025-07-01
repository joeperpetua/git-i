#!/usr/bin/env node

import { Command } from 'commander'
import { add } from './handlers/actions.js';

const program = new Command()

program
  .name('git-i')
  .description('Interactive git wrapper')
  .version('0.1.0')

program
  .command('add')
  .description('Stage files for commit')
  .action(add)

program.parse(process.argv)