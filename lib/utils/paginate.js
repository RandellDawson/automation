const { owner, repo, octokitConfig, octokitAuth } = require('../constants');

const octokit = require('@octokit/rest')(octokitConfig);

octokit.authenticate(octokitAuth);

const paginate = async (method, methodProps) => {
  let response = await method(methodProps);
  let { data } = response;
  while (octokit.hasNextPage(response)) {
    response = await octokit.getNextPage(response);
    let { data: moreData } = response;
    data = data.concat(moreData);
  }
  return data;
};

module.exports = { paginate };