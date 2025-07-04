import { Result } from "execa"
import start from "./handlers/start.js"

export const escapeChars = (text: string, chars: string[]) => {
  for (const char of chars) {
    text = text.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`)
  }
  return text
}

export const handleEnd = (result: Result<{}>, interactive?: boolean) => {
  if (result.stderr) console.error(result.stderr)
  if (result.stdout) console.log(result.stdout)
  if (interactive) start();
}
