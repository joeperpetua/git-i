# git-interactive

A command-line tool that provides a simple, interactive interface for common Git operations.

## Overview

`git-interactive` is designed to streamline your daily Git workflow. Instead of remembering various Git commands and flags, you can use this tool to perform actions like adding, committing, and pushing changes through an easy-to-use interactive menu.

It's perfect for both beginners who are learning Git and experienced developers who want to speed up their workflow.

## Installation

To install `git-interactive` globally on your system, run the following command:

```bash
npm install -g git-interactive
```

## Usage

You can use `git-interactive` in two main ways:

### 1. Interactive Mode

Run the tool without any arguments to launch the main menu. This menu lists all available actions.

```bash
git-i
```

You will see a prompt like this:

```
? What would you like to do? › - Use arrow-keys. Return to submit.
❯   Add files
    Restore changes
    Delete branches
    Commit changes
    Amend previous commit
    Push to remote
    Force push to remote
    Exit
```

Navigate with arrow keys and press `Enter` to select an option.

### 2. Direct Command Mode

You can also execute a specific command directly from your terminal.

```bash
git-i <command> [options]
```

## Supported Commands

### `add`

Interactively select files to stage for the next commit. It displays a list of all new, modified, or deleted files in your working directory.

**Usage:**
```bash
git-i add
```

This will show a checklist of files. Use the `<space>` bar to select/deselect files and `<enter>` to stage them.

### `restore`

Interactively unstage files or discard changes in your working directory.

**Usage:**
```bash
git-i restore
```

This command presents a list of both staged and unstaged changes.
- Selecting **staged** changes will unstage them (equivalent to `git restore --staged <file>`).
- Selecting **unstaged** changes will discard them from your working directory (equivalent to `git restore <file>`).

### `branch delete`

Interactively select and delete local branches.

**Usage:**
```bash
git-i branch delete
```

It lists all local branches except for the current branch, allowing you to select multiple branches for deletion.

### `commit`

Guides you through creating a commit.

**Usage:**
```bash
git-i commit
```

**Options:**
- `--amend`: Use this flag to amend the previous commit instead of creating a new one. The interactive menu provides a separate option for this.

The command will prompt you for a commit message (required) and an optional commit description.

### `push`

Guides you through pushing your changes to a remote repository.

**Usage:**
```bash
git-i push
```

**Options:**
- `--force`: Use this flag to perform a force push. The interactive menu provides a separate option for this.

The command will prompt you to select a remote and a branch to push to, defaulting to the current branch.

## Contributing

Contributions are welcome! If you have ideas for new features or find a bug, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.