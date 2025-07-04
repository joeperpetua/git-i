const separator = '\n' + '*'.repeat(50) + '\n'

const catchCheckboxError = (err: any) => {
  if (err?.name === 'ExitPromptError') {
    return []
  }
  console.log(separator)
  console.error('Error:', err)
  console.log(separator)
  return []
}

const catchInputError = (err: any) => {
  if (err?.name === 'ExitPromptError') {
    return ''
  }
  console.log(separator)
  console.error('Error:', err)
  console.log(separator)
  return ''
}

const catchExecError = (err: any) => {
  console.log(separator)
  console.error('Error while running command: ', err.command)

  if (err.stderr) {
    console.log(separator)
    console.error(err.stderr)
  }

  if (err.stdout) {
    console.log(separator)
    console.error(err.stdout)
  }
}

export {
  catchCheckboxError,
  catchInputError,
  catchExecError,
  separator
}