import "dotenv/config";

import Ffmpeg from "fluent-ffmpeg";
import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import puppeteer from "puppeteer-extra";
import puppeteerStealth from "puppeteer-extra-plugin-stealth";
import { spawn } from "child_process";
import ytdl from "ytdl-core";

const command = Ffmpeg();

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
        fs.writeFile(".env", `TOKEN=${token} \n TRACK=`, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(chalk.bold.greenBright("Client ID and Secret Saved"));
          }
        });
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
  console.log(chalk.bold.greenBright("Playing song.."));
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

  const { spawn } = require("child_process");

  const filePath =
    "/Users/christopherpfaff/ImportantProjects/ts-s-cli/audio.mp3";
  const player1 = spawn("afplay", [filePath]);

  player1.on("error", (error: Error) => {
    console.error(`spawn error: ${error}`);
  });

  player1.stdout.on("data", (data: string) => {
    console.log(`stdout: ${data}`);
  });

  player1.stderr.on("data", (data: string) => {
    console.error(`stderr: ${data}`);
  });

  player1.on("close", (code: string) => {
    console.log(`child process exited with code ${code}`);
  });

  // const filePath =
  //   "/Users/christopherpfaff/Important\\ Projects/ts-s-cli/audio.mp3";
  // const command = `afplay ${filePath}`;
  // exec(command, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`exec error: ${error}`);
  //     return;
  //   }
  //   console.log(`stdout: ${stdout}`);
  //   console.error(`stderr: ${stderr}`);
  // });
  // const finalPlayer = "afplay"; // Make sure this is the correct command
  // const player1 = spawn("afplay", [
  //   "/Users/christopherpfaff/Important Projects/audio.mp3",
  // ]);

  // player1.on("error", (error) => {
  //   console.error(`spawn error: ${error}`);
  // });

  // player1.stdout.on("data", (data) => {
  //   console.log(`stdout: ${data}`);
  // });

  // player1.stderr.on("data", (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  // player1.on("close", (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
  // exec(
  //   '/usr/bin/afplay "/Users/christopherpfaff/Important Projects/ts-s-cli/audio.mp3"',
  //   (error, stdout, stderr) => {
  //     if (error) {
  //       console.error(`exec error: ${error}`);
  //       return;
  //     }
  //     console.log(`stdout: ${stdout}`);
  //     console.error(`stderr: ${stderr}`);
  //   }
  // );
};

const chooseTrack = async () => {
  if (!process.env.TRACK) {
    console.log(
      chalk.bold.redBright(
        "Please run the artist command first to get the top tracks"
      )
    );
    return;
  }
  const tracks = process.env.TRACK.split(",");
  inquirer
    .prompt([
      {
        type: "list",
        name: "track",
        choices: tracks,
      },
    ])
    .then((answer) => {
      puppeteer.use(puppeteerStealth());
      puppeteer.launch({ headless: true }).then(async (browser) => {
        const page = await browser.newPage();
        await page.goto(
          "https://www.youtube.com/results?search_query=" +
            answer.track +
            " official video"
        );
        await page.waitForSelector("#video-title");
        await page.click("#video-title");
        const url = await page.url();
        await browser.close();
        ytdl(url, { filter: "audioonly" })
          .pipe(fs.createWriteStream("video.mp3"))
          .on("finish", () => {
            console.log(chalk.bold.greenBright("Song Downloaded"));
            const ffmpegConvert = new Promise((resolve, reject) => {
              exec(
                `ffmpeg -i video.mp3 -vn -ab 128k -ar 44100 -y audio.mp3`,
                (error) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve("done");
                  }
                }
              );
            });
            ffmpegConvert.then(() => {
              playSong();
            });
          });
      });
    });
};

export { promptKeys, getArtistInfo, playSong, chooseTrack };
