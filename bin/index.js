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
const node_process_1 = __importDefault(require("node:process"));
const yargs_1 = __importDefault(require("yargs"));
yargs_1.default
    .options({
    name: {
        alias: "n",
        describe: "Name of the artist",
        type: "string",
    },
})
    .parse();
const argv = (0, yargs_1.default)(node_process_1.default.argv).argv;
const access_token = [];
if (!argv.name) {
    console.error("Please provide a name");
    node_process_1.default.exit(1);
}
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
    access_token.push(json.access_token);
});
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
