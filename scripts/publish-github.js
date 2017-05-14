#!/usr/bin/env node
//https://nodejs.org/en/download/releases/
const cp = require('child_process');
const path = require('path');
const bindings = require('../lib/binding.js');
const packageJson = require('../package.json');
const GithubApi = require('github');

const versions = [];
Object.keys(packageJson.binary.abis).forEach(function listversions(abi) {
  versions.push({
    node: packageJson.binary.abis[abi] + '/x64',
    version: abi,
  });
});

async function run() {
  let release;
  let releases;
  const tag = 'bin-v' + bindings.versionInfo.binversion;

  const github = new GithubApi({
    headers: {
      'user-agent': 'fcopy-upload',
    },
    host: 'api.github.com',
    protocol: 'https',
  });
  github.authenticate({
    token: process.env.FCOPY_GITHUB_TOKEN,
    type: 'oauth',
  });

  const repo = {
    owner: 'sciolist',
    repo: 'fcopy',
  };

  do {
    releases = await github.repos.getReleases(Object.assign({}, repo, {per_page: 100}));
    release = releases.data.find(d => d.tag_name === tag);
    if (github.hasNextPage(releases)) {
      releases = await github.getNextPage(releases);
    } else {
      break;
    }
  } while (!release);

  if (!release) {
    console.log('creating new release draft ' + tag);
    release = await github.repos.createRelease(Object.assign({}, repo, {
      draft: true,
      name: tag,
      tag_name: tag,
    }));
  }

  const assets = (await github.repos.getAssets(Object.assign({}, repo, {id: release.id}))).data;

  for (const abi of versions) {
    const fileName = bindings.buildModuleName(Object.assign({}, bindings.versionInfo, {
      abi: abi.version,
    })) + '.node';
    const filePath = bindings.bindingRoot + '/' + fileName;
    const foundAsset = assets.find(a => a.name === fileName);
    
    await buildVersion(abi);
    if (foundAsset) {
      await github.repos.deleteAsset(Object.assign({}, repo, {
        id: foundAsset.id,
      }));
    }

    await github.repos.uploadAsset(Object.assign({}, repo, {
      filePath,
      id: release.id,
      name: fileName,
    }));
  }

  console.log('\n\nrelease: ' + release.html_url);

  function buildVersion(abi) {
    return new Promise(function buildVersion(resolve, reject) {
      const output = cp.spawnSync('bash', ['./build.sh', abi.node], {
        cwd: path.resolve(__dirname),
        stdio: ['inherit', 'inherit', 'inherit'],
      });
      if (output.error || output.status) {
        reject(output.error || new Error(String(output.stderr || output.status)));
      } else {
        resolve();
      }
    });
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
