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
exports.getArtistInfo = exports.promptKeys = void 0;
require("dotenv/config");
const chalk_1 = __importDefault(require("chalk"));
const promises_1 = __importDefault(require("fs/promises"));
const inquirer_1 = __importDefault(require("inquirer"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const promptKeys = () => {
    return inquirer_1.default
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
        const artist = answers.artist;
        const token = process.env.TOKEN;
        console.log(artist, token);
        const response = yield fetch(`https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`, {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
        });
        if (!response.ok) {
            console.log(chalk_1.default.bold.redBright(`HTTP error! did you add API key and secret?
          https://developer.spotify.com/documentation/web-api/concepts/apps
          `));
        }
        const data = yield response.json();
        const imageURL = data.artists.items[0].images[1].url;
        const image = yield fetch(imageURL);
        if (!image.ok) {
            throw new Error("Image not fetched successfully");
        }
        console.log(path_1.default.resolve(__dirname, "../images/data.jpg"));
        const buffer = yield image.arrayBuffer();
        const bufferImage = Buffer.from(buffer);
        const fullImage = (0, sharp_1.default)(bufferImage);
        yield fullImage.toFile(path_1.default.resolve(__dirname, "../img/data.jpg"));
        console.log(chalk_1.default.bold.greenBright("Image saved"));
        return data;
    }));
};
exports.getArtistInfo = getArtistInfo;
