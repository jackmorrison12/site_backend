var APIFragmentHandler = require("../apiFragmentHandler.js");
var APILastUpdatedHandler = require("../apiLastUpdatedHandler.js");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  userAgent: "jackmorrison.xyz v0.1",
  auth: process.env.GITHUB_API_KEY,
  timeZone: "Europe/London",
});

//Remember BST again
module.exports = class GithubHandler {
  constructor() {}

  static async update() {
    console.log("Updating github...");
    var res = await APILastUpdatedHandler.update("github");
    console.log(res);
    var res = await APIFragmentHandler.getMostRecentFragment("github");
    if (res.length < 1) {
      var last_date = new Date(Date.now() - 1209600000); // 2 weeks ago
    } else {
      var last_date = Date.parse(res[0].occur_date) + 1;
      // var last_date = new Date(Date.now() - 1209600000); // 2 weeks ago
      // var last_date = new Date(Date.now() - 1156000);
    }
    // console.log(new Date(last_date));
    const { data } = await octokit.activity.listEventsForAuthenticatedUser({
      username: process.env.GITHUB_USERNAME,
      per_page: 100,
    });
    // console.log(data);

    // console.log(last_date);

    for (const item of data) {
      var count = 1;
      var meta = {};
      if (new Date(Date.parse(item.created_at)) < last_date) {
        break;
      }
      var other = false;
      switch (item.type) {
        case "PushEvent":
          var type = "git_push";
          var message =
            item.payload.size > 1
              ? "Pushed " +
                item.payload.size +
                " commits to the repo " +
                item.repo.name
              : "Pushed a commit to the repo " +
                item.repo.name +
                ", with message '" +
                item.payload.commits[0].message +
                "'";
          count = item.payload.size;
          if (item.payload.size == 1) {
            meta.message = item.payload.commits[0].message;
            meta.commit_sha = item.payload.commits[0].sha;
          }
          meta.repo = item.repo.name;
          break;
        case "CommitCommentEvent":
          var type = "git_commit_comment";
          var message =
            "Commented '" +
            item.payload.comment.body +
            "' on a commit from the repo " +
            item.repo.name;
          meta.comment = item.payload.comment.body;
          meta.repo = item.repo.name;
          break;
        case "CreateEvent":
          var type =
            item.payload.ref_type == "repository"
              ? "git_create_repo"
              : item.payload.ref_type == "branch"
              ? "git_create_branch"
              : "git_create_tag";
          var message =
            item.payload.ref_type == "repository"
              ? "Created the repository " + item.repo.name
              : item.payload.ref_type == "branch"
              ? "Created a branch called '" +
                item.payload.ref +
                "' in repo " +
                item.repo.name
              : "Created a tag " +
                item.payload.ref +
                " in repo " +
                item.repo.name;
          meta.repo = item.repo.name;
          if (item.payload.ref_type !== "repository") {
            meta.name = item.payload.ref;
          }
          break;
        case "DeleteEvent":
          var type =
            item.payload.ref_type == "repository"
              ? "git_delete_repo"
              : item.payload.ref_type == "branch"
              ? "git_delete_branch"
              : "git_delete_tag";
          var message =
            item.payload.ref_type == "repository"
              ? "Deleted the repository " + item.repo.name
              : item.payload.ref_type == "branch"
              ? "Deleted a branch called '" +
                item.payload.ref +
                "' from repo " +
                item.repo.name
              : "Deleted a tag " +
                item.payload.ref +
                " from repo " +
                item.repo.name;
          break;
        case "ForkEvent":
          var type = "git_fork";
          var message = "Forked the repo " + item.repo.name;
          meta.repo = item.repo.name;
          break;
        case "IssueCommentEvent":
          var type =
            item.payload.action == "created"
              ? "git_create_issue_comment"
              : item.payload.action == "deleted"
              ? "git_delete_issue_comment"
              : "git_edit_issue_comment";
          var message =
            item.payload.action == "created"
              ? "Commented '" +
                item.payload.comment.body +
                "' on the issue '" +
                item.payload.issue.title +
                "' from the repo " +
                item.repo.name
              : item.payload.action == "deleted"
              ? "Deleted a comment from the issue '" +
                item.payload.issue.title +
                "' from the repo " +
                item.repo.name
              : "Changed a comment on the issue '" +
                item.payload.issue.title +
                "' from the repo " +
                item.repo.name;
          break;
        case "IssuesEvent":
          switch (item.payload.action) {
            case "opened":
              var type = "git_issue_open";
              var message =
                "Opened the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "closed":
              var type = "git_issue_close";
              var message =
                "Closed the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "reopened":
              var type = "git_issue_reopen";
              var message =
                "Reopened the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "assigned":
              var type = "git_issue_assign";
              var message =
                "Assigned the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name +
                " to " +
                item.payload.assignee.name;
              break;
            case "unassigned":
              var type = "git_issue_unassign";
              var message =
                "Unassigned the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name +
                " from " +
                item.payload.assignee.name;
              break;
            case "labeled":
              var type = "git_issue_label";
              var message =
                "Added the label '" +
                item.payload.label.name +
                "' to the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "unlabeled":
              var type = "git_issue_unlabel";
              var message =
                "Removed the label '" +
                item.payload.label.name +
                "' from the issue '" +
                item.payload.issue.title +
                "' in the repo " +
                item.repo.name;
              break;
            default:
              other = true;
          }
          break;
        case "PublicEvent":
          var type = "git_public";
          var message = "Made the repository " + item.repo.name + " public";
          break;
        case "PullRequestEvent":
          switch (item.payload.action) {
            case "opened":
              var type = "git_pull_request_open";
              var message =
                "Opened the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "closed":
              var type = "git_pull_request_close";
              var message =
                "Closed the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "reopened":
              var type = "git_pull_request_reopen";
              var message =
                "Reopened the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "assigned":
              var type = "git_pull_request_assign";
              var message =
                "Assigned the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name +
                " to " +
                item.payload.assignee.name;
              break;
            case "unassigned":
              var type = "git_pull_request_unassign";
              var message =
                "Unassigned the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name +
                " from " +
                item.payload.assignee.name;
              break;
            case "labeled":
              var type = "git_pull_request_label";
              var message =
                "Added the label '" +
                item.payload.label.name +
                "' to the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "unlabeled":
              var type = "git_pull_request_unlabel";
              var message =
                "Removed the label '" +
                item.payload.label.name +
                "' from the pull request '" +
                item.payload.pull_request.title +
                "' in the repo " +
                item.repo.name;
              break;
            case "review_requested":
              var type = "git_pull_request_review_request";
              var message =
                "Requested a review on the pull request '" +
                item.payload.pull_request.title +
                "' from the repo " +
                item.repo.name;
              break;
            case "review_request_removed":
              var type = "git_pull_request_review_request_remove";
              var message =
                "Removed a request for a review on the pull request '" +
                item.payload.pull_request.title +
                "' from the repo " +
                item.repo.name;
              break;
            case "synchronize":
              var type = "git_pull_request_synchronize";
              var message =
                "Synchronised the pull request '" +
                item.payload.pull_request.title +
                "' from the repo " +
                item.repo.name;
              break;
            default:
              other = true;
          }
          break;
        case "PullRequestReviewCommentEvent":
          var type = "git_pull_request_review_comment";
          var message =
            "Commented '" +
            git.payload.comment.body +
            "' on the pull request '" +
            item.payload.pull_request.title +
            "' from the repo " +
            item.repo.name;
          break;
        case "WatchEvent":
          var type = "git_watch";
          var message = "Starred the repository " + item.repo.name;
          meta.repo = item.repo.name;
          break;
        default:
          other = true;
      }
      // console.log(message);
      res = await APIFragmentHandler.insertFragment(
        type,
        "github",
        null,
        message,
        item.created_at,
        count,
        meta
      );
      console.log(res);
    }
    var res = await APILastUpdatedHandler.update("github");
    console.log(res);
  }
};
