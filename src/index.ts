#!/usr/bin/env node

import "dotenv/config";

import yargs, { array } from "yargs";

import axios from "axios";
import fs from "fs";
import process from "node:process";

interface Arguments {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
  n: string;
}

interface ArrayArgs {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
  a: string[];
}

yargs
  .usage("Usage: nodejs-spotify-cli <ts-s-cli> [options]")
  .options({
    n: {
      describe: "Search with name of the artist",
      type: "string",
    },
    a: {
      describe: "Add api key and secret in [api secret] format ignore brackets",
      type: "array",
    },
  })
  .parse();

const argv = yargs(process.argv).argv as Arguments;
const argsArray = yargs.array("a").argv as ArrayArgs;

const getToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(process.env.API + ":" + process.env.SECRET).toString(
          "base64"
        ),
    },
  });

  const json = await response.json();
  return json.access_token;
};

if (argsArray.a) {
  if (argsArray.a.length > 1) {
    fs.writeFileSync(".env", `API=${argsArray.a[0]}\nSECRET=${argsArray.a[1]}`);
  } else {
    console.error("Please provide both API key and secret");
    process.exit(1);
  }
}

if (!argv.n) {
} else if (argv.n.length > 0) {
  async function getArtistInfo(access_token: string, name: string) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + access_token },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! did you add API key and secret? 
      https://developer.spotify.com/documentation/web-api/concepts/apps
      `);
    }
    return await response.json();
  }
  getToken().then((token) => {
    getArtistInfo(token, argv.n).then((profile) => {
      console.log(profile.artists.items);
    });
  });
}
