#!/usr/bin/env node

import "dotenv/config";

import { getArtistInfo, promptKeys } from "./utils/util";

import { Command } from "commander";
import path from "path";
import showImage from "./utils/processImage";

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
    showImage(path.resolve(__dirname, "../bin/img/data.jpg"));
  });
program.parse();
