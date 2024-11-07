import { readDir, organize, promptDir } from './organizer.mjs';

const main = async () => {
	// Get arguments from the CLI
	let path = process.argv[2];

	// If the path is undefined, prompt the user to give a directory
	if (path === undefined) {
		path = await promptDir();
	}

	// quit the program
	if (path === null) {
		return;
	}

	// Read the contents of the directory
	const files = await readDir(path);

	// If there are no contents in the directory, end the program and alert the user
	if (files.length === 0) {
		console.log(
			`There are no files specified in the directory you typed.\nDirectory typed: ${path}`
		);
		return;
	}

	// organize the file contents into their own directory
	await organize(files, path);

	console.log('files succesfully organized!');
};

// run program
main();
