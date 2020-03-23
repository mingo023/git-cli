#!/usr/bin/env node
const { showPrompt } = require('./lib/inquirer');

const run = async () => {
	showPrompt();
};

run();
