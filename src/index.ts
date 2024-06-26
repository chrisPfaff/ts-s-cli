#!/usr/bin/env node

import "dotenv/config";

import { chooseTrack, getArtistInfo, playSong, promptKeys } from "./utils/util";

import { Command } from "commander";
import { SpotifyTrack } from "../types/SpotifyTrackType";
import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";

const program = new Command();
let tracks: string[] = [];

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

program.command("play").description("Play song on Spotify").action(playSong);

program
  .command("choose")
  .description("Choose a Track to get Song")
  .action(chooseTrack);

program
  .command("artist")
  .description("Get artist info")
  .action(async () => {
    const res = await getArtistInfo();
    const imageURL = res.data.images[0].url;
    const name = res.data.name;
    const topTracks = res.tracks.tracks.map((track: SpotifyTrack) => {
      tracks.push(track.name);
      return track.name;
    });
    fs.writeFile(
      ".env",
      `TOKEN=${process.env.TOKEN} \n TRACK=${tracks.join(",")}`
    );
    exec(`curl -s  ${imageURL}| imgcat`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(` 
          \n ${chalk.bold.greenBright(`Artist Name:`)}${name} 
          ${stdout}
          \n ${chalk.bold.blueBright("Followers:")} ${res.data.followers.total}
          \n ${chalk.bold.yellowBright("Popularity:")} ${res.data.popularity} 
          \n ${chalk.bold.cyanBright("Genres:")} ${res.data.genres}
          \n ${chalk.bold.magentaBright("Spotify URL:")} ${
        res.data.external_urls.spotify
      }
          \n ${chalk.bold.redBright("Top Tracks:")} ${topTracks.join(", ")}
          `);
    });
  });

program.parse();
