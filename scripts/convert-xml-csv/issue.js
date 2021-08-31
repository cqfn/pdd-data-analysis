const fs = require('fs');
const GitHub = require('github-api');

const gh = new GitHub({username: 'mbao01', token: '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'});
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
                console.log('Error C', e.response.status);
                if (e.response.status === 403) {
                    throw Error(e.message);
                }
                return {};
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
                                console.log('Error B', e.message);
                                if (e.response.status === 403) {
                                    throw Error(e.message);
                                }
                                return {};
                            });
                        }
                    }
                }
                return data;
            }).catch((e) => {
                console.log('Error A', e.message);
                if (e.response.status === 403) {
                    throw Error(e.message);
                }
                return {};
            });

            return {...issueData, ...eventsData, done: true };
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
    const cache = { issues: {}, repos: {} };
    const issues = await Promise.all((puzzles).map(async (puzzle) => {
        const data = await getIssueData(puzzle.issueLink, cache);
        return {done: false, ...data, ...puzzle};
    }));

    fs.writeFileSync('../../data/extended-issues.json', JSON.stringify(issues, null, 2), 'utf8');
}

main();
