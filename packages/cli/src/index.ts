#!/usr/bin/env node

/**
 * Filact CLI
 * Code generation and scaffolding tool
 */

import { Command } from 'commander'
import { generateResource } from './commands/generate-resource.js'
import { generateComponent } from './commands/generate-component.js'

const program = new Command()

program
  .name('filact')
  .description('CLI for Filact - code generation and scaffolding')
  .version('0.1.0')

// Generate resource command
program
  .command('generate:resource <name>')
  .alias('g:resource')
  .alias('gr')
  .description('Generate a new resource with CRUD operations')
  .option('-p, --path <path>', 'Output path', './src/resources')
  .option('-f, --fields <fields>', 'Comma-separated field definitions (name:type)', '')
  .option('--no-list', 'Skip list page generation')
  .option('--no-create', 'Skip create page generation')
  .option('--no-edit', 'Skip edit page generation')
  .option('--no-show', 'Skip detail/show page generation')
  .action(async (name, options) => {
    await generateResource(name, options)
  })

// Generate component command
program
  .command('generate:component <name>')
  .alias('g:component')
  .alias('gc')
  .description('Generate a custom component')
  .option('-p, --path <path>', 'Output path', './src/components')
  .option('-t, --type <type>', 'Component type (functional|class)', 'functional')
  .option('--with-test', 'Generate test file')
  .option('--with-stories', 'Generate Storybook stories')
  .action(async (name, options) => {
    await generateComponent(name, options)
  })

// Init command
program
  .command('init')
  .description('Initialize a new Filact project')
  .option('-p, --path <path>', 'Project path', '.')
  .action(async (options) => {
    console.log('🚧 Init command coming soon!')
    console.log('Path:', options.path)
  })

program.parse()
