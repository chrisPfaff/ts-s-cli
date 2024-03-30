#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const util_1 = require("./utils/util");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const program = new commander_1.Command();
program
    .name("Spotify-info-cli")
    .description("CLI to search spotify artist info")
    .version("0.0.0");
program
    .command("keys")
    .description("Input client ID and Secret from https://developer.spotify.com/dashboard/applications")
    .action(util_1.promptKeys);
program
    .command("artist")
    .description("Get artist info")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, util_1.getArtistInfo)();
    const imageURL = res.images[0].url;
    const name = res.name;
    (0, child_process_1.exec)(`curl -s  ${imageURL}| imgcat`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(` 
          \n ${chalk_1.default.bold.greenBright(`Artist Name:`)}${name} 
          ${stdout}
          \n ${chalk_1.default.bold.blueBright("Followers:")} ${res.followers.total}
          \n ${chalk_1.default.bold.yellowBright("Popularity:")} ${res.popularity} 
          \n ${chalk_1.default.bold.cyanBright("Genres:")} ${res.genres}
          \n ${chalk_1.default.bold.magentaBright("Spotify URL:")} ${res.external_urls.spotify}
          `);
    });
}));
program.parse();
