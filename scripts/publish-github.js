#!/usr/bin/env node
//https://nodejs.org/en/download/releases/
const cp = require('child_process');
const path = require('path');
const bindings = require('../lib/binding.js');
const package = require('../package.json');
const GithubApi = require('github');

const VERSIONS=[];
Object.keys(package.binary.abis).forEach(function (abi) {
  VERSIONS.push({ version: abi, node: package.binary.abis[abi] + '/x64' });
});

async function run() {
  let release;
  let releases;
  const tag = 'bin-v' + bindings.versionInfo.binversion;

  const github = new GithubApi({
    protocol: "https",
    host: "api.github.com",
    headers: {
      "user-agent": "fcopy-upload"
    },
  })
  github.authenticate({
    "type": "oauth",
    "token": process.env.FCOPY_GITHUB_TOKEN
  });

  const repo = {
    owner: 'sciolist',
    repo: 'fcopy'
  }

  do {
    releases = await github.repos.getReleases(Object.assign({}, repo, { per_page: 100 }));
    release = releases.data.find(d => d.tag_name === tag);
    if (github.hasNextPage(releases)) releases = await github.getNextPage(releases);
    else break;
  } while(!release);

  if (!release) {
    console.log('creating new release draft ' + tag);
    release = await github.repos.createRelease(Object.assign({}, repo, {
      draft: true,
      name: tag,
      tag_name: tag
    }))
  }

  let assets = (await github.repos.getAssets(Object.assign({}, repo, { id: release.id }))).data;

  for (var abi of VERSIONS) {
    var fileName = bindings.buildModuleName(Object.assign({}, bindings.versionInfo, {
      abi: abi.version
    })) + '.node';
    var filePath = bindings.bindingRoot + '/' + fileName;
    var foundAsset = assets.find(a => a.name === fileName);
    
    await buildVersion(abi);
    if (foundAsset) {
      await github.repos.deleteAsset(Object.assign({}, repo, {
        id: foundAsset.id
      }));
    }

    const asset = await github.repos.uploadAsset(Object.assign({}, repo, {
      id: release.id,
      filePath: filePath,
      name: fileName
    }));
  }

  console.log('\n\nrelease: ' + release.html_url);

  function buildVersion(abi) {
    return new Promise(function (resolve, reject) {
      var output = cp.spawnSync('bash', ['./build.sh', abi.node], {
        cwd: path.resolve(__dirname),
        stdio: ['inherit', 'inherit', 'inherit']
      });
      if (output.error || output.status) {
        reject(output.error || new Error(String(output.stderr || output.status)));
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
