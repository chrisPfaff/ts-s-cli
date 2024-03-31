import "dotenv/config";

import { SpotifyTrack } from "../../types/SpotifyTrackType";
import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";
import inquirer from "inquirer";

const promptKeys = () => {
  return inquirer
    .prompt([
      {
        type: "password",
        name: "clientID",
        message: "Enter your Spotify Client ID",
      },
      {
        type: "password",
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
      console.log(answers.artist);
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
      //https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg/top-tracks
      const data = await response.json();

      const fetchTopTracks = await fetch(
        `https://api.spotify.com/v1/artists/${data.artists.items[0].id}/top-tracks`,
        {
          method: "GET",
          headers: { Authorization: "Bearer " + token },
        }
      );
      const topTracks = await fetchTopTracks.json();

      return { data: data.artists.items[0], tracks: topTracks };
    });
};

const playSong = async () => {
  const players = [
    "mplayer",
    "afplay",
    "mpg123",
    "mpg321",
    "play",
    "omxplayer",
    "aplay",
    "cmdmp3",
    "cvlc",
    "powershell",
  ];
  const player = new Promise((resolve, reject) => {
    players.forEach((player) => {
      exec(`which ${player}`, (error, stdout, stderr) => {
        if (stdout !== "") {
          resolve(player);
        }
      });
    });
  });
  const finalPlayer = await player;
  console.log(finalPlayer);
};

export { promptKeys, getArtistInfo, playSong };
