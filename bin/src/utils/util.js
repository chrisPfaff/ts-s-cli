"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseTrack = exports.playSong = exports.getArtistInfo = exports.promptKeys = void 0;
require("dotenv/config");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const command = (0, fluent_ffmpeg_1.default)();
const promptKeys = () => {
    return inquirer_1.default
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
        const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                body: new URLSearchParams({
                    grant_type: "client_credentials",
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " +
                        Buffer.from(answers.clientID + ":" + answers.secret).toString("base64"),
                },
            });
            if (!response.ok) {
                throw new Error("HTTP error! did you add API key and secret?");
            }
            const json = yield response.json();
            return json.access_token;
        });
        getToken().then((token) => {
            fs_1.default.writeFile(".env", `TOKEN=${token} \n TRACK=`, (err) => {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(chalk_1.default.bold.greenBright("Client ID and Secret Saved"));
                }
            });
        });
    });
};
exports.promptKeys = promptKeys;
const getArtistInfo = () => {
    return inquirer_1.default
        .prompt([
        {
            type: "input",
            name: "artist",
            message: "Enter the Name of the Artist",
        },
    ])
        .then((answers) => __awaiter(void 0, void 0, void 0, function* () {
        const artist = answers.artist;
        const token = process.env.TOKEN;
        const response = yield fetch(`https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`, {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
        });
        if (!response.ok) {
            console.log(chalk_1.default.bold.redBright(`HTTP error! did you add API key and secret?
          https://developer.spotify.com/documentation/web-api/concepts/apps
          `));
        }
        //https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg/top-tracks
        const data = yield response.json();
        const fetchTopTracks = yield fetch(`https://api.spotify.com/v1/artists/${data.artists.items[0].id}/top-tracks`, {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
        });
        const topTracks = yield fetchTopTracks.json();
        return { data: data.artists.items[0], tracks: topTracks };
    }));
};
exports.getArtistInfo = getArtistInfo;
const playSong = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(chalk_1.default.bold.greenBright("Playing song.."));
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
            (0, child_process_1.exec)(`which ${player}`, (error, stdout, stderr) => {
                if (stdout !== "") {
                    resolve(player);
                }
            });
        });
    });
    const { spawn } = require("child_process");
    const filePath = "/Users/christopherpfaff/ImportantProjects/ts-s-cli/audio.mp3";
    const player1 = spawn("afplay", [filePath]);
    player1.on("error", (error) => {
        console.error(`spawn error: ${error}`);
    });
    player1.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });
    player1.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });
    player1.on("close", (code) => {
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
});
exports.playSong = playSong;
const chooseTrack = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.TRACK) {
        console.log(chalk_1.default.bold.redBright("Please run the artist command first to get the top tracks"));
        return;
    }
    const tracks = process.env.TRACK.split(",");
    inquirer_1.default
        .prompt([
        {
            type: "list",
            name: "track",
            choices: tracks,
        },
    ])
        .then((answer) => {
        puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
        puppeteer_extra_1.default.launch({ headless: true }).then((browser) => __awaiter(void 0, void 0, void 0, function* () {
            const page = yield browser.newPage();
            yield page.goto("https://www.youtube.com/results?search_query=" +
                answer.track +
                " official video");
            yield page.waitForSelector("#video-title");
            yield page.click("#video-title");
            const url = yield page.url();
            yield browser.close();
            (0, ytdl_core_1.default)(url, { filter: "audioonly" })
                .pipe(fs_1.default.createWriteStream("video.mp3"))
                .on("finish", () => {
                console.log(chalk_1.default.bold.greenBright("Song Downloaded"));
                const ffmpegConvert = new Promise((resolve, reject) => {
                    (0, child_process_1.exec)(`ffmpeg -i video.mp3 -vn -ab 128k -ar 44100 -y audio.mp3`, (error) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve("done");
                        }
                    });
                });
                ffmpegConvert.then(() => {
                    playSong();
                });
            });
        }));
    });
});
exports.chooseTrack = chooseTrack;
