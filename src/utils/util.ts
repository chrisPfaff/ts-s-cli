import "dotenv/config";

import chalk from "chalk";
import fs from "fs";
import { get } from "node:http";
import inquirer from "inquirer";

const promptKeys = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "clientID",
        message: "Enter your Spotify Client ID",
      },
      {
        type: "input",
        name: "secret",
        message: "Enter your Spotify Client Secret",
      },
    ])
    .then((answers) => {
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
              Buffer.from(answers.clientID + ":" + answers.secret).toString(
                "base64"
              ),
          },
        });
        if (!response.ok) {
          throw new Error("HTTP error! did you add API key and secret?");
        }
        const json = await response.json();
        return json.access_token;
      };
      getToken().then((token) => {
        fs.writeFileSync(".env", `TOKEN=${token}`);
        console.log(chalk.bold.greenBright("Client ID and Secret Saved"));
      });
    });
};

const getArtistInfo = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "artist",
        message: "Enter the Name of the Artist",
      },
    ])
    .then(async (answers) => {
      const artist = answers.artist;
      const token = process.env.TOKEN;
      console.log(artist, token);
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (!response.ok) {
        console.log(
          chalk.bold.redBright(`HTTP error! did you add API key and secret?
          https://developer.spotify.com/documentation/web-api/concepts/apps
          `)
        );
      }
      return await response.json();
    });
};

export { promptKeys, getArtistInfo };
