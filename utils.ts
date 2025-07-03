export const escapeChars = (text: string, chars: string[]) => {
  for (const char of chars) {
    text = text.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`)
  }
  return text
}
