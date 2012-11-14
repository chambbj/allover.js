# GitHub workflow for submitting pull requests

This document describes the recommended workflow to maintain a fork of a GitHub repository and how to submit pull requests for new features or bug fixes. The examples used on this page refer to the Allover.js origin repository but this workflow can be used for any GitHub repository. This workflow is based off the [OpenShift GitHub workflow for submitting pull requests](https://openshift.redhat.com/community/wiki/github-workflow-for-submitting-pull-requests).

# Forking a repository

Before you can begin editing code you must first create a fork of the GitHub repository you wish to contribute to.

1. Navigate to the GitHub page of the repository you wish to fork (e.g., https://github.com/CRREL/allover.js).
2. Click on the fork button on the top right corner of the page.

This creates a copy of the repository in your own GitHub space.

# Cloning your fork

## Clone the repository from your fork

    git clone git@github.com:<username>/allover.js.git

## Add the upstream repo so that you can pull changes

    git remote add upstream git@github.com:CRREL/allover.js.git

# Working on a topic branch

Always try to avoid working on the master branch. It usually results in merge conflicts and/or update issues. Instead, work on a bug/feature/topic branch whenever possible.

    #start from the master branch
    git checkout master

    #create a new branch
    git branch dev/chambb/bug/12345

    #switch to the new branch
    git checkout dev/chambbj/bug/12345

Of course, you can always create and switch at the same time...

    #create a new branch and switch to it
    git checkout -b dev/chambbj/bug/12345

    #...make changes...

# Staying updated

Once a fork has been created, it does not automatically track the upstream repository. Follow the steps outlined below to keep the master branch up-to-date.

    #pull the latest changes from upstream
    git fetch upstream

    #make sure there are no un-committed changes
    git stash

    #make sure we are working on the master branch
    git checkout master

    #merge the latest changes
    git merge upstream/master

    #push the updates changes to our GitHub fork
    git push origin master

    #return to your bug/feature branch
    git checkout dev/chambbj/bug/12345

    #rebase this branch onto latest code from master (expect conflicts)
    git rebase master

    #... resolve conflicts

    #push the rebased branch back to your fork
    git push origin dev/chambbj/bug/12345 -f

    #Restore any un-committed changes
    git stash pop

NOTE: The git stash steps are optional. It is easier if you commit all changes before attempting a rebase.

# Submitting a patch
Once your code is ready to be submitted, you will need to submit a pull request with your changes.

1. Update your branch and make sure you are rebased off the latest upstream/master
2. Squash your commits onto a single revision
3. Submit a pull request on GitHub

## Squashing your changes into one revision

Before you can submit a request, rebase all your changes on to a single commit. This makes it easier to review and also makes reverting the code easier in case of any build breakages.

    git rebase -i master
    #... squash commits ...

For more information about squashing commits, read [this](http://git-scm.com/book/en/Git-Tools-Rewriting-History#Squashing-Commits).

# Creating a pull request

[GitHub instructions on creating a pull request](https://help.github.com/articles/using-pull-requests).

If you need to make changes to your commit after a pull request has been issues, you can go back to the pull request page and update the commit range rather than submit a new pull requests.
