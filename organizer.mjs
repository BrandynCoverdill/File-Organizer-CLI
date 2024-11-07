import readline from 'node:readline/promises';
import fs from 'node:fs/promises';
import path from 'node:path';

// set up readline interface
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

/**
 * Read all file contents in specified directory
 */
async function readDir(dir) {
	const files = await fs.readdir(dir);
	return files;
}

/**
 * Prompt user for directory if user didnt specify directory in CLI
 */
async function promptDir() {
	const dir = await rl.question(
		'A directory was not specified. Please enter a directory to organize (or type "quit" or "q" to exit):\n'
	);

	// If the user types "quit" or "q" to exit the program, exit and return null to signify this
	if (dir.toLowerCase() === 'quit' || dir.toLowerCase() === 'q') {
		rl.close();
		return null;
	}

	// verify input
	let isValid = false;
	isValid = await verifyDir(dir);
	if (!isValid) {
		return promptDir();
	} else {
		rl.close();
		return dir;
	}
}

/**
 * Create sub directories
 */
async function createSubDir(directory) {
	// Create the subdirectory if it doesnt exist
	try {
		await fs.access(directory);
	} catch (err) {
		await fs.mkdir(directory, { recursive: true });
	}
}

/**
 * Move file to the correct sub directory
 */
async function moveFile(oldDir, newDir, file) {
	const basename = path.basename(file);
	try {
		await fs.rename(oldDir + '/' + basename, newDir + '/' + basename);
	} catch (err) {
		console.error(err);
	}
}

/**
 * Organize files in correct directories
 */
async function organize(files, dir) {
	// set to hold file extentions
	const images = new Set([
		'.png',
		'.jpg',
		'.jpeg',
		'.gif',
		'.bmp',
		'.tff',
		'.tiff',
		'.svg',
		'.webp',
		'.heic',
		'.heif',
		'.raw',
		'.nef',
		'.cr2',
		'.orf',
		'.psd',
	]);
	const documents = new Set([
		'.txt',
		'.rtf',
		'.docx',
		'.doc',
		'.xls',
		'.xlsx',
		'.ods',
		'.csv',
		'.ppt',
		'.pptx',
		'.odp',
		'.key',
		'.pdf',
		'.xps',
		'.epub',
		'.mobi',
		'.azw',
		'.azw3',
		'.md',
		'.rst',
		'.html',
		'.xml',
		'.json',
	]);
	const audio = new Set([
		'.wav',
		'.aiff',
		'.flac',
		'.m4a',
		'.mp3',
		'.aac',
		'.ogg',
		'.wma',
		'.m4a',
		'.opus',
	]);
	const video = new Set([
		'.mp4',
		'.avi',
		'.mov',
		'.wmv',
		'.webm',
		'.flv',
		'.mkv',
		'.mpeg',
		'.mpg',
		'.mts',
		'.m2ts',
		'.3gp',
		'.mxf',
	]);

	// go through each file and depending on the filetype, create a subdirectory for it and move it there
	for (const file of files) {
		let found = false;
		const ext = path.extname(file).toLowerCase();
		const filePath = path.join(dir, file);
		const stat = await fs.stat(filePath);
		if (stat.isDirectory()) {
			continue; // skip folders
		}

		for (const key of images) {
			if (key === ext) {
				// create image subdirectory and move to it
				await createSubDir(dir + '/images');
				await moveFile(dir, dir + '/images', file);
				found = true;
				break;
			}
		}
		if (found) continue;

		for (const key of documents) {
			if (key === ext) {
				// create documents subdirectory and move to it
				await createSubDir(dir + '/documents');
				await moveFile(dir, dir + '/documents', file);
				found = true;
				break;
			}
		}
		if (found) continue;

		for (const key of audio) {
			if (key === ext) {
				// create audio subdirectory and move to it
				await createSubDir(dir + '/audio');
				await moveFile(dir, dir + '/audio', file);
				found = true;
				break;
			}
		}
		if (found) continue;

		for (const key of video) {
			if (key === ext) {
				// create video subdirectory and move to it
				await createSubDir(dir + '/video');
				await moveFile(dir, dir + '/video', file);
				found = true;
				break;
			}
		}

		if (found) continue;

		// move file to a subdirectory called "other" if it is not a folder
		await createSubDir(dir + '/other');
		await moveFile(dir, dir + '/other', file);
	}
}

/**
 * Verify directory
 */
async function verifyDir(dir) {
	let hasError = false;

	// dir cannot be empty
	if (dir.trim() === '') {
		hasError = true;
	} else {
		// validate if the path is a valid directory
		try {
			const stat = await fs.stat(dir);
			hasError = !stat.isDirectory();
		} catch (err) {
			// if there is not path, there is an error
			hasError = true;
		}
	}

	return !hasError;
}

// export functions
export { readDir, promptDir, createSubDir, organize };
