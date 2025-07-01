const catchCheckboxError = (err: any) => {
  if (err?.name === 'ExitPromptError') {
    return []
  }
  console.error('Error:', err)
  return []
}

const catchExecError = (err: any) => {
  console.error('Error while running command: ', err.command)
  console.error('')
  console.error(err.stderr)
}

export {
  catchCheckboxError,
  catchExecError
}