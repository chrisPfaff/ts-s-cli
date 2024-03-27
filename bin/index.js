#!/usr/bin/env node
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
require("dotenv/config");
const yargs_1 = __importDefault(require("yargs"));
const fs_1 = __importDefault(require("fs"));
const node_process_1 = __importDefault(require("node:process"));
yargs_1.default
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
const argv = (0, yargs_1.default)(node_process_1.default.argv).argv;
const argsArray = yargs_1.default.array("a").argv;
const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " +
                Buffer.from(node_process_1.default.env.API + ":" + node_process_1.default.env.SECRET).toString("base64"),
        },
    });
    const json = yield response.json();
    return json.access_token;
});
if (argsArray.a) {
    if (argsArray.a.length > 1) {
        fs_1.default.writeFileSync(".env", `API=${argsArray.a[0]}\nSECRET=${argsArray.a[1]}`);
    }
    else {
        console.error("Please provide both API key and secret");
        node_process_1.default.exit(1);
    }
}
if (!argv.n) {
    console.error("Please provide a name");
    node_process_1.default.exit(1);
}
else if (argv.n.length > 0) {
    function getArtistInfo(access_token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`, {
                method: "GET",
                headers: { Authorization: "Bearer " + access_token },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! did you add API key and secret? 
      https://developer.spotify.com/documentation/web-api/concepts/apps
      `);
            }
            return yield response.json();
        });
    }
    getToken().then((token) => {
        getArtistInfo(token, argv.n).then((profile) => {
            console.log(profile.artists.items);
        });
    });
}
