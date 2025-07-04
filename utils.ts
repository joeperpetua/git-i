import { Result } from "execa"
import start from "./handlers/start.js"

export const escapeChars = (text: string, chars: string[]) => {
  for (const char of chars) {
    text = text.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`)
  }
  return text
}

export const handleEnd = (result: Result<{}>, interactive?: boolean) => {
  for (const out of result.stdio) out && console.log(out)
  if (interactive) start();
}
