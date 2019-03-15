/*
This script checks the last comment made on a PR and if it is not the OP 
and is greater than 21 days, it displays to the console as "suspect stale".
*/

const {
  getPRs,
  getUserInput,
  getFiles,
  getMembers,
  getPrComments
} = require('../lib/get-prs');

const { ProcessingLog, rateLimiter } = require('../lib/utils');

const log = new ProcessingLog('find-potentially-stale-prs');


log.start();
console.log('started...');
(async () => {

  const members = await getMembers();
  const { totalPRs, firstPR, lastPR } = await getUserInput();
  const prPropsToGet = ['number', 'labels', 'user', 'created_at'];
  const { openPRs } = await getPRs(totalPRs, firstPR, lastPR, prPropsToGet);
  let count = 0;
  if (openPRs.length) {
    console.log('Processing PRs...');
    for (let i = 0; i < openPRs.length; i++) {
      let {
        number,
        labels: currentLabels,
        user: { login: username },
        created_at
      } = openPRs[i];
      const prFiles = await getFiles(number);
      count++;
      const prComments = await getPrComments(number);
      console.log('PR #: ', number, username, created_at);
      console.log(prComments);
      const firstDate = new Date(created_at);
      const lastDate = new Date(prComments.issueComments[prComments.issueComments.length -1].updated_at);
      var daysSinceLastComment = Math.floor(Math.abs(lastDate - firstDate) / 1000 / 86400);
      console.log('Difference: ' + days);
      console.log('\n\n');
      log.add(number, { number });
      if (count > 4000) {
        await rateLimiter(2350);
      }
    }
  }
})()
  .then(() => {
    log.finish();
    console.log('complete');
  })
  .catch(err => {
    log.finish();
    console.log(err);
  });
