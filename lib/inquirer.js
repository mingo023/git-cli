const { exec } = require('child_process');
const inquirer = require('inquirer');
const simpleGit = require('simple-git/promise');

const getUntrackFiles = async () => {
	const git = simpleGit();

	return (await git.status()).not_added;
};

const questions = [
	{
		type: 'list',
		name: 'type',
		message: 'What does this commit do?',
		choices: ['Feature', 'Fix', 'Refactor'],
		filter: function(val) {
			return val.toLowerCase();
		},
	},
	{
		type: 'input',
		name: 'branchName',
		message: 'What is branch name?',
	},
	{
		type: 'checkbox',
		name: 'files',
		message: 'What is file which you want to commit?',
		choices: getUntrackFiles,
		filter: function(val) {
			return val;
		},
	},
	{
		type: 'input',
		name: 'commitMessage',
		message: 'What is your commit message?',
	},
	{
		type: 'input',
		name: 'prMessage',
		message: 'What is your PR message?',
	},
];

const showPrompt = () => {
	inquirer.prompt(questions).then(answers => {
		const { type, branchName, files, commitMessage, prMessage } = answers;
		const script = `
      git checkout -b ${type}/${branchName} &&
      git add ${files.join(' ')} &&
      git commit -m '${commitMessage}' &&
      git push origin ${type}/${branchName} &&
      hub pull-request -m '${prMessage}'
    `;
		exec(script, (err, stdout, stderr) => {
			console.log(stdout);
		});
	});
};

exports.showPrompt = showPrompt;
