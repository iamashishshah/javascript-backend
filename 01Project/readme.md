## How to make application

step 1: First make node application so that you can do everything using node application
- npm init -y or npm init
step 2: install the required packages
step 3: for production we require "dot env" package

## why do we need env file?
to set environmental variable, because we don't know what 'port' or 'database_url' user is giving, so we've to make it variable


## Why do we deploy and how the deployment works?
- we're working on our computer and testing and everything is doing great, but our machine can't be on 24X7, so we need a machine where we can put our code and It's avalable 24x7.
so server is nothing just machine like our computer, which is running 24x7 and have some constraint



## How to push existing file into git?
echo "# deployTest" >> README.md

git init

git add README.md

git commit -m "first commit"

git branch -M main

git remote add origin https://github.com/thisisashishshah/deployTest.git

git push -u origin main



## How to generate '.gitignore' file automatically

use cmd pallete and add into node

## How to create file using cmd line on windows
echo "initial content" > filename.extension
