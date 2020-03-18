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
      hub pull-request -m '${prMessage}' -o
    `;
		spinner.start();
		exec(script, (err, stdout, stderr) => {
			spinner.stop();
			if (err) {
				console.log(err);
			}
			console.log(stdout);
		});
	});
};

exports.showPrompt = showPrompt;
