const fs = require('fs');
const GitHub = require('github-api');

const gh = new GitHub({
    token: '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'
});
async function getIssueData(issueLink, cache) {
    if (issueLink) {
        const match = issueLink.match(/(https?:\/\/github.com\/)(.+)\/(.+)(\/issues\/)([0-9]+)/);
        const [,,user,repo,,issueNo] = match;
        if (issueNo && user && repo) {
            const issues = cache.issues[`${user}/${repo}`] || gh.getIssues(user, repo);
            cache.issues[`${user}/${repo}`] = issues;
            const issueData = await issues.getIssue(issueNo).then(({ data: issue }) => {
                if (issue) {
                    const {
                        comments,
                        milestone,
                        state,
                        closed_at,
                        author_association,
                        created_at,
                        updated_at,
                        assignees,
                        locked,
                        labels,
                        pull_request
                    } = issue;
                    return {
                        comments,
                        state,
                        closed_at,
                        created_at,
                        updated_at,
                        assignees,
                        locked,
                        labels,
                        pull_request,
                        milestone,
                        author_association
                    };
                }

                return {};
            }).catch((e) => {
                console.log('B: ', e?.response?.status);
                if (e?.response?.status === 403) {
                    return {done: false};
                } else {
                    return {}
                }
            });

            const eventsData = await issues.listIssueEvents(issueNo).then(async ({ data: events }) => {
                const data = { code: {}, all_commits: [] };
                if (events) {
                    for (const {event, commit_id} of events) {
                        data[event] = (data[event] || 0) + 1;

                        if (commit_id) {
                            await gh.getRepo(user, repo).getSingleCommit(commit_id).then(({ data: commit }) => {
                                const { commit: { comment_count }, stats, files } = commit;
                                data.all_commits.push({
                                    comment_count,
                                    raw_stats: stats,
                                    files: files.map(({ additions, changes, deletions, status, filename }) => ({
                                        additions,
                                        changes,
                                        deletions,
                                        status,
                                        filename
                                    }))
                                })
                                if (stats) {
                                    const { total, additions, deletions } = stats;
                                    if (total && total < 1000) {
                                        data.code.changes = (data.code.changes || 0) + total;
                                        data.code.additions = (data.code.additions || 0) + additions;
                                        data.code.deletions = (data.code.deletions || 0) + deletions;
                                    }
                                }
                            }).catch((e) => {
                                console.log('C: ', e?.response?.status);
                                if (e?.response?.status === 403) {
                                    return {done: false};
                                } else {
                                    return {}
                                }
                            });
                        }
                    }
                }
                return data;
            }).catch((e) => {
                console.log('A: ', e?.response?.status);
                if (e?.response?.status === 403) {
                    return { done: false };
                } else {
                    return {}
                }
            });

            return {done: true, ...issueData, ...eventsData };
        }
    }
    return {};
}

function processIssueEvent(event) {
    switch (event) {
        case 'title':
            return null;
        default:
            return null;
    }
}

async function main() {
    const puzzles = require('../../data/all-puzzles.json');
    // const e0 = require('../../data/extended-issues-0.json');
    // const e1 = require('../../data/extended-issues-1.json');
    // const e2 = require('../../data/extended-issues-2.json');
    //
    // const e0Arr = e0.map(p => p.id);
    // const e1Arr = e1.map(p => p.id);
    // const e2Arr = e2.map(p => p.id);
    //
    // const filtered = puzzles.filter((p) => !(e0Arr.includes(p.id) || e1Arr.includes(p.id) || e2Arr.includes(p.id)));
    
    const cache = { issues: {}, repos: {} };
    const issues = await Promise.all((puzzles.slice(1100, 1200)).map(async (puzzle) => {
        const data = await getIssueData(puzzle.issueLink, cache);
        return { done: false, ...data, ...puzzle };
    }));

    fs.writeFileSync('../../data/extended.json', JSON.stringify(issues, null, 2), 'utf8');
}

main();
