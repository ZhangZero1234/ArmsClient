#!/usr/bin/env node
var download = require("download-git-repo");
var handlebars = require("handlebars");
var program = require('commander');
var inquirer = require('inquirer');
const chalk = require('chalk');
const execa = require('execa');
let ora = require("ora");
var fs = require("fs");

let questions = [
    {
        type: 'list',
        name: 'name',
        message: 'Please write a name of project.',
        choices:["myApp"]
    },
    {
        type: 'list',
        name: 'version',
        message: 'Please write a version of project.',
        choices:["0.0.1"]
    },
    {
        type: 'list',
        name: 'description',
        message: 'Please write a description of project.',
        choices:["This is a client help you to create your project"]
    },
    {
        type: 'list',
        name: 'author',
        message: 'Please write a author of project.',
        choices:["Seven"]
    }
];

let downloadWay = [
    {
        type: 'list',
        name: 'way',
        message: 'Which way you choose to download the packages.',
        choices:["NPM","Manually"],
        filter: function(val) {
            return val=="NPM";
        }
    }
];

program
.version("0.1.0")

program
.description('create a new project powered by Arms-cli-service')
.option("-i,--init <template> <project>", "Which exec mode to use")
.action((projectName,option)=>{
    let templateName = option.init
    let spinner = ora('downloading the template from github:ZhangZero1234/armsTemplate...');
    spinner.start();
    download("github:ZhangZero1234/armsTemplate",projectName,async (err)=>{
        if(err){spinner.fail();return} spinner.succeed();
        let answers = await inquirer.prompt(questions)
        let package = projectName+"/package.json";
        let content = fs.readFileSync(package,"utf8");
        let template = handlebars.compile(content);
        let res = template(answers)
        fs.writeFileSync(package,res);

        getPackages("a","b",projectName);
    });
  
})

program.parse(process.argv);   

async function getPackages(command,args,dir){
    let answers = await inquirer.prompt(downloadWay);
    
    if(answers.way)
    {
        console.log(chalk.green("> npm install --save"))
        const child = await execa("npm",["i","--save"],{
            cwd:"./myapp",
            stdio: ['inherit', 'pipe', 'inherit'],
            shell:true
        });

    process.stdout.write(child.stdout);
    }
    else{
        console.log(chalk.green("> cd "+dir))
        console.log(chalk.green("> npm install --save"))
    }
    
} 