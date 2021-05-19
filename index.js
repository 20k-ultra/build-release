const core = require('@actions/core');
const github = require('@actions/github');
const util = require('util');

let owner, repo, sha, octokit;

async function run() {
	try {
		const token = core.getInput('token', { required: true });
		owner = getOwner(github.context.payload.pull_request.base.repo.url);
		repo = getRepo(github.context.payload.pull_request.base.repo.url);
		sha = getSha(github.context.payload);
		octokit = github.getOctokit(token);

		// run build...
		const releaseId = (Math.random() * 1000000).toFixed(0);
		core.setOutput('releaseId', releaseId);

		// Update output of this check to contain releaseID
		await updateOutput(sha, releaseId);
		// ...check update output
		const checkPost = await getCheckRuns(sha);
	} catch (error) {
		core.setFailed(error.message);
	}
}

async function updateOutput(sha, releaseId) {
	const checks = await getCheckRuns(sha);
	const buildCheck = getBuildCheck(checks.check_runs);
	await octokit.request(
		'PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}',
		{
			owner,
			repo,
			check_run_id: buildCheck.id,
			output: {
				title: 'Build release',
				summary: 'Succssfully built a new release!',
				text: releaseId,
			},
		},
	);
}

async function getCheckRuns(sha) {
	return (
		await octokit.request(
			'GET /repos/{owner}/{repo}/commits/{ref}/check-runs',
			{
				owner,
				repo,
				ref: sha,
			},
		)
	).data;
}

function getBuildCheck(checks) {
	return checks.filter((c) => c.name === 'build release')[0];
}

function getOwner(url) {
	return new URL(url).pathname.split('/')[2];
}

function getRepo(url) {
	return new URL(url).pathname.split('/')[3];
}

function getSha(context) {
	const url = context.pull_request._links.statuses.href.split('/');
	return url[url.length - 1];
}

run();
