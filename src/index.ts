#!/usr/bin/env node

import "dotenv/config";

import axios from "axios";
import process from "node:process";
import yargs from "yargs";

interface Arguments {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
  name: string;
  api: string;
}

yargs
  .options({
    name: {
      alias: "n",
      describe: "Name of the artist",
      type: "string",
    },
  })
  .parse();
const argv = yargs(process.argv).argv as Arguments;

const access_token: string[] = [];
if (!argv.name) {
  console.error("Please provide a name");
  process.exit(1);
}

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
  access_token.push(json.access_token);
};

getToken();
console.log(access_token);
// (() => {
//   async function getToken() {
//     const response = await fetch("https://accounts.spotify.com/api/token", {
//       method: "POST",
//       body: new URLSearchParams({
//         grant_type: "client_credentials",
//       }),
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         Authorization:
//           "Basic " +
//           Buffer.from(process.env.API + ":" + process.env.SECRET).toString(
//             "base64"
//           ),
//       },
//     });

//     return await response.json();
//   }

//   async function getArtistInfo(access_token: string, name: string) {
//     const response = await fetch(
//       `https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`,
//       {
//         method: "GET",
//         headers: { Authorization: "Bearer " + access_token },
//       }
//     );

//     return await response.json();
//   }

//   getToken().then((response) => {
//     getArtistInfo(response.access_token, argv.name).then((profile) => {
//       console.log(profile.artists.items);
//     });
//   });
// })();
