import { input } from "@inquirer/prompts";
import { execa } from "execa";
import { handleEnd } from "../utils.js";
import { catchInputError, catchExecError } from "./errors.js";

const commit = async ({ interactive, amend }: { interactive?: boolean, amend?: boolean }) => {
  try {
    const previousCommitMessage = await execa('git', ['log', '-1', '--pretty=%B']).then(res => res.stdout.trim());
    const commitMessage = await input({
      message: amend ? 'Amend message (tab to edit | backspace to delete):' : 'Commit message:',
      default: amend ? previousCommitMessage : '',
      required: true,
    }).catch(catchInputError);
    if (!commitMessage) process.exit(0); // User cancelled the prompt
    
    const commitDescription = await input({ message: 'Commit description:' }).catch(catchInputError);

    const args = ['commit', '-m', commitMessage];
    if (commitDescription) args.push('-m', commitDescription);
    if (amend) args.push('--amend');

    const result = await execa('git', args);
    handleEnd(result, interactive)
  }
  catch (err: any) {
    catchExecError(err)
  }
}

export default commit;