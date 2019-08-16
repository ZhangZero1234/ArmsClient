#!/usr/bin/env node
var program = require('commander');
var download = require("download-git-repo");
var inquirer = require('inquirer');
var handlebars = require("handlebars");
const { exec } = require('child_process');
const readline = require('readline');
var ProgressBar = require('progress');
let ora = require("ora");
var fs = require("fs");
const logSymbols = require('log-symbols');
var install = require('npm-install-package');
var cmd=require('node-cmd');
const execa = require('execa');
program.version("0.1.0")

program
.description('create a new project powered by Arms-cli-service')
.option("-i,--init <template> <project>", "Which exec mode to use")
.action((projectName,option)=>{
    let templateName = option.init
    var questions = [
    {
        type: 'text',
        name: 'name',
        message: 'Please write a name of project.',
    },
    {
        type: 'text',
        name: 'version',
        message: 'Please write a version of project.',
    },
    {
        type: 'text',
        name: 'description',
        message: 'Please write a description of project.',
    },
    {
        type: 'text',
        name: 'author',
        message: 'Please write a author of project.',
    }
    ];
    let spinner = ora('downloading the template from github:ZhangZero1234/armsTemplate...');
    spinner.start();
    download("github:ZhangZero1234/armsTemplate",projectName,(err)=>{
        if(err){spinner.fail();return} spinner.succeed();
        inquirer.prompt(questions).then(answers => {
            
            let package = projectName+"/package.json";
            let content = fs.readFileSync(package,"utf8");
            let template = handlebars.compile(content);
            let res = template(answers)
            fs.writeFileSync(package,res);
            getPackages("./"+projectName+"/package.json");
          });
    });
})


program.parse(process.argv);      
async function getPackages(path){
    let conJson = JSON.parse(fs.readFileSync(path,"utf8"));
    let devDependencies = Object.keys(conJson.devDependencies);
    let dependencies =  Object.keys(conJson.dependencies);
    let total = devDependencies.length + dependencies.length;
    // let packSpinner = ora('Ready to download the packages from https://www.npmjs.com/package...');
    // packSpinner.start();
    const child = await execa("npm",["i","--save"],{
        cwd:"./myapp",
        stdio: ['inherit', 'pipe', 'inherit'],
        shell:true
    });
} 