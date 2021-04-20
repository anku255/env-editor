import { Octokit } from "@octokit/core";
import jsonexport from 'jsonexport';

let octokit;
const owner = 'yellowclass';

async function getPullRequest({ base, head, repo }) {
  const res = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
    owner,
    repo,
    head: `${owner}:${head}`,
    base: `${base}`
  });
  if (!res.data.length) return null;
  const pr = res.data[0];
  return { pullNo: pr.number, HTMLUrl: pr.html_url };
}

async function createPullRequest({ base, head, repo, title, description }) {
  try {
    const res = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      head,
      base,
      title,
      description
    });
    if (res.status !== 201) return null;
    const pr = res.data;
    return { pullNo: pr.number, HTMLUrl: pr.html_url };
  } catch (error) {
    console.log("error", error);
    return null;
  }
}

async function createOrReturnPullRequest({ base, head, repo, title, description }) {
  const existingPR = await getPullRequest({ base, head, repo });
  if (existingPR) return existingPR;
  return createPullRequest({ base, head, repo, title, description });
}

async function didEnvChange({ repo, pullNo }) {
  const res = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
    owner,
    repo,
    pull_number: pullNo
  });
  const files = res.data;
  return files.map(f => f.filename).includes('.env.example');
}



async function createCSVRow({ repo, head, base, title, description }) {
  const pullRequest = await createOrReturnPullRequest({ base, head, repo, title, description });
  if (!pullRequest) return null;
  const { pullNo, HTMLUrl } = pullRequest;
  const envChanged = await didEnvChange({ repo, pullNo });
  return {
    'PRs': HTMLUrl,
    'Repo Name': repo,
    'Changed ENVs': envChanged ? 'ENV Changed' : '-',
    'Prod ENV Set': '',
    'Merged': '',
    'Released': ''
  };
}

async function getCSVFromJSON(data) {
  return new Promise((resolve, reject) => {
    jsonexport(data, function (err, csv) {
      if (err) return reject(err);
      resolve(csv);
    });
  })
}

export default async (req, res) => {
  const { githubToken, repos, head, base, title, description } = req.body;
  if (!githubToken) return res.status(400).json({ status: false, message: "You need to pass githubToken in body " });

  octokit = new Octokit({ auth: githubToken });

  let csvRows = await Promise.all(repos.map(repo => createCSVRow({ repo, head, base, title, description })));
  csvRows = csvRows.filter(Boolean);

  if (csvRows.length === 0) return res.status(400).json({ status: false, message: `There is no diff between ${head} and ${base} in any repo` });

  const csv = await getCSVFromJSON(csvRows);
  res.status(200).json({ status: true, data: csv });
}