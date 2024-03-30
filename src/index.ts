#!/usr/bin/env node

import "dotenv/config";

import { getArtistInfo, promptKeys } from "./utils/util";

import { Command } from "commander";
import chalk from "chalk";
import { exec } from "child_process";

const program = new Command();

program
  .name("Spotify-info-cli")
  .description("CLI to search spotify artist info")
  .version("0.0.0");

program
  .command("keys")
  .description(
    "Input client ID and Secret from https://developer.spotify.com/dashboard/applications"
  )
  .action(promptKeys);

program
  .command("artist")
  .description("Get artist info")
  .action(async () => {
    const res = await getArtistInfo();
    const imageURL = res.images[0].url;
    const name = res.name;
    exec(`curl -s  ${imageURL}| imgcat`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(` 
          \n ${chalk.bold.greenBright(`Artist Name:`)}${name} 
          ${stdout}
          \n ${chalk.bold.blueBright("Followers:")} ${res.followers.total}
          \n ${chalk.bold.yellowBright("Popularity:")} ${res.popularity} 
          \n ${chalk.bold.cyanBright("Genres:")} ${res.genres}
          \n ${chalk.bold.magentaBright("Spotify URL:")} ${
        res.external_urls.spotify
      }
          `);
    });
  });
program.parse();
