import SwaggerParser from "swagger-parser";
const fs = require('fs');
const YAML = require('json-to-pretty-yaml');
//
export class Converter {
    constructor(args) {
        console.log();//break line to start
        let parsedArgs = this._parseArgs(args);
        this.inPath = parsedArgs.in;
        this.outPath = parsedArgs.out;
    }

    async run() {
        try {
            if (!this._validateArgs()) return;
            let parsedYML = await SwaggerParser.validate(this.inPath);
            let convertedYML = this._parseOpenAPIToServeless(parsedYML);
            fs.writeFileSync(this.outPath, convertedYML);
            console.log("Converted with success!");
            //console.log(convertedYML)
        } catch(err) {
            console.error(err);
        } finally {
            console.log(); //end with a break of line
        }
    }
    
    
    
    //Helper functions
    _parseArgs(args) {
        return {
            in: args[2],
            out: args[3],
        }
    }
    _validateArgs() {
        if (!(this.inPath && this.inPath.length > 0)) {
            this._printError("OpenAPI file is not specified (input)");
            return false;
        } else if (!fs.existsSync(this.inPath)) {
            this._printError("OpenAPI file does not exists!");
            return false;
        } else if (!(this.outPath && this.outPath.length > 0)) {
            this._printError("Output path is not specified");
            return false;
        } 
        //No error checks
        if (fs.existsSync(this.outPath)) {
            console.log("Output path already exists, overwritting it!");
        } return true;
    }
    _printError(error) {
        console.error(error);
        console.log("Usage: cmd path/openapi.yml path/output.yml");
    }
    
    //Parse
    _parseOpenAPIToServeless(openAPI) {
        let retVal = {};
        for (let pathName in openAPI.paths) {
            let methods = Object.keys(openAPI.paths[pathName]);
            for (let method of methods) {
                let funcName = this._getFunctionName(pathName, method);
                retVal[funcName] = {
                    handler: "src/" + this._getSrcPath(pathName, method),
                    events: [
                        { http: { path: pathName, method: method.toUpperCase() } }
                    ]
                }
            }
        } return YAML.stringify(retVal);
    }
    //
    _getFunctionName(path, method) {
        let formattedPath = path.replace(/\{[^()]*\}/g,"").split("/").map((item)=>{
                                    //cammel case
            return (item.substr( 0, 1 ).toUpperCase() + item.substr( 1 ))
        }).join("");
        return method + formattedPath;
    }
    _getSrcPath(path, method) {
        let formattedPath = path.replace(/\{[^()]*\}/g,"").split("/").map((item, index)=>{
            //cammel case
            return (item.substr( 0, 1 ).toUpperCase() + item.substr( 1 ))
        }).join("");
        return formattedPath.substr(0, 1).toLowerCase() + formattedPath.substr(1) + "." + method;
    }
    
}