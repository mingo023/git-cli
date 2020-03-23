const { exec } = require('child_process');
const inquirer = require('inquirer');
const simpleGit = require('simple-git/promise');
const Spinner = require('clui').Spinner;

const spinner = (countdown = new Spinner('Please waiting for handling', [
	'⣾',
	'⣽',
	'⣻',
	'⢿',
	'⡿',
	'⣟',
	'⣯',
	'⣷',
]));

const getChangedFiles = async () => {
	const git = simpleGit();

	return (await git.status()).files.map(item => item.path);
};

const questions = [
	{
		type: 'confirm',
		name: 'isCheckout',
		message: 'Do you want to checkout branch',
	},
	{
		type: 'list',
		name: 'type',
		message: 'What does this commit do?',
		choices: ['Feature', 'Fix', 'Refactor'],
		filter: function(val) {
			return val.toLowerCase();
		},
		when: answers => answers.isCheckout,
	},
	{
		type: 'input',
		name: 'branchName',
		message: 'What is branch name?',
		when: answers => answers.isCheckout,
	},
	{
		type: 'checkbox',
		name: 'files',
		message: 'What is file which you want to commit?',
		choices: getChangedFiles,
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
		when: answers => answers.isCheckout,
	},
];

const showPrompt = () => {
	inquirer.prompt(questions).then(answers => {
		const {
			isCheckout,
			type,
			branchName,
			files,
			commitMessage,
			prMessage,
		} = answers;
		let script = `
      ${isCheckout ? `git checkout -b ${type}/${branchName} &&` : ''}
      git add ${files.join(' ')} &&
      git commit -m '${commitMessage}' &&
			git push --set-upstream origin $(git rev-parse --abbrev-ref HEAD)
      ${prMessage ? `&& hub pull-request -m '${prMessage}' -o` : ''}
		`;

		spinner.start();
		console.log(script);
		exec(script, (error, stdout, stderr) => {
			spinner.stop();
			console.log(stdout);
		});
	});
};

exports.showPrompt = showPrompt;
