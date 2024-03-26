#!/usr/bin/env node

import "dotenv/config";

import process from "node:process";
import yargs from "yargs/yargs";

interface Arguments {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
  name: string;
  api: string;
}
const argv = yargs(process.argv).argv as Arguments;

(() => {
  async function getToken() {
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

    return await response.json();
  }

  async function getArtistInfo(access_token: string, name: string) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + access_token },
      }
    );

    return await response.json();
  }

  getToken().then((response) => {
    getArtistInfo(response.access_token, argv.name).then((profile) => {
      console.log(profile.artists.items);
    });
  });
})();
