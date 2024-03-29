import "dotenv/config";

import chalk from "chalk";
import fs from "fs/promises";
import inquirer from "inquirer";
import path from "path";
import sharp from "sharp";

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
        fs.writeFile(".env", `TOKEN=${token}`);
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
      const data = await response.json();
      const imageURL = data.artists.items[0].images[1].url;
      const image = await fetch(imageURL);
      if (!image.ok) {
        throw new Error("Image not fetched successfully");
      }
      const buffer = await image.arrayBuffer();
      const bufferImage = Buffer.from(buffer);
      const fullImage = sharp(bufferImage);
      await fullImage.toFile(path.resolve(__dirname, "../img/data.jpg"));
      return data;
    });
};

export { promptKeys, getArtistInfo };
