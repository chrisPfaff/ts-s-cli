#!/usr/bin/env node

import "dotenv/config";

import fs from "fs";
import process from "node:process";

const { Command } = require("commander");
const program = new Command();

program
  .name("string-util")
  .description("CLI to some JavaScript string utilities")
  .version("0.8.0");

program
  .command("keys")
  .description(
    "Input client ID and Secret from https://developer.spotify.com/dashboard/applications"
  )
  .arguments("<ClientID> <Secret>")
  .action((clientID: string, secret: string) => {
    const getToken = async () => {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(clientID + ":" + secret).toString("base64"),
        },
      });
      if (!response.ok) {
        throw new Error("HTTP error! did you add API key and secret?");
      }
      const json = await response.json();
      return json.access_token;
    };
    getToken().then((token) => {
      fs.writeFileSync(".env", `Token=${token}`);
      console.log("Token saved run artist command to get artist info");
    });
  });

program
  .command("artist")
  .description("Get artist info")
  .arguments("<artist>")
  .action((artist: string) => {
    async function getArtistInfo() {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + process.env.Token },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! did you add API key and secret?
      https://developer.spotify.com/documentation/web-api/concepts/apps
      `);
      }
      return await response.json();
    }
    getArtistInfo().then((profile) => {
      console.log(profile.artists.items);
    });
  });
program.parse();
