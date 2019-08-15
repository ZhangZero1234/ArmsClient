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

    // console.log(projectName,templateName);
})


program.parse(process.argv);      
function getPackages(path){
    let conJson = JSON.parse(fs.readFileSync(path,"utf8"));
    let devDependencies = Object.keys(conJson.devDependencies);
    let dependencies =  Object.keys(conJson.dependencies);
    let total = devDependencies.length + dependencies.length;
    
    let flag = true;
    let bar = new ProgressBar('downloading [:bar] :percent :etas :packName', { total: total });
    let startNum = 0;
    let outputStream = process.stdout;
    // outputStream.write(`[${startNum},${total}] ${devDependencies[0]}`,'utf-8'); 
    let packSpinner = ora('Ready to download the packages from https://www.npmjs.com/package...');
    packSpinner.start();
    for(let i = 0 ; i < devDependencies.length;i++){
        
        exec('cd myapp && npm i --save--dev '+devDependencies[i], (error, stdout, stderr) => {
            if (error) {
                console.error(`执行的错误: ${error}`);
                packSpinner.fail();
                return;
            }
            if(flag){
                flag = false;packSpinner.succeed();
            }
            // startNum++;
            bar.tick({packName:devDependencies[i]});
            // readline.clearLine(outputStream);
            // readline.cursorTo(outputStream,0);
            // outputStream.write(`[${startNum},${total}] ${devDependencies[i]}`,'utf-8');
          
        });
    }
    for(let i = 0 ; i < dependencies.length;i++){
        // let packSpinner = ora("downloading the "+dependencies[i]+" from npm...")
        // packSpinner.start();
        exec('cd myapp && npm i --save '+dependencies[i], (error, stdout, stderr) => {
            if (error) {
                console.error(`执行的错误: ${error}`);
                // packSpinner.fail();
                return;
            }
            if(flag){
                flag = false;packSpinner.succeed();
            }
            bar.tick({packName:dependencies[i]});
            // packSpinner.succeed();
            // console.log(`stdout: ${stdout}`);
            // console.log(`stderr: ${stderr}`);
        });
    }
}