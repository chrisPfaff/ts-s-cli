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
exports.playSong = exports.getArtistInfo = exports.promptKeys = void 0;
require("dotenv/config");
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const promises_1 = __importDefault(require("fs/promises"));
const inquirer_1 = __importDefault(require("inquirer"));
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
            promises_1.default.writeFile(".env", `TOKEN=${token}`);
            console.log(chalk_1.default.bold.greenBright("Client ID and Secret Saved"));
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
        console.log(answers.artist);
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
    const finalPlayer = yield player;
    console.log(finalPlayer);
});
exports.playSong = playSong;
