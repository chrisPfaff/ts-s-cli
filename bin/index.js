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
const fs_1 = __importDefault(require("fs"));
const node_process_1 = __importDefault(require("node:process"));
const { Command } = require("commander");
const program = new Command();
program
    .name("string-util")
    .description("CLI to some JavaScript string utilities")
    .version("0.8.0");
program
    .command("keys")
    .description("Input client ID and Secret from https://developer.spotify.com/dashboard/applications")
    .arguments("<ClientID> <Secret>")
    .action((clientID, secret) => {
    const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(clientID + ":" + secret).toString("base64"),
            },
        });
        if (!response.ok) {
            throw new Error("HTTP error! did you add API key and secret?");
        }
        const json = yield response.json();
        return json.access_token;
    });
    getToken().then((token) => {
        fs_1.default.writeFileSync(".env", `Token=${token}`);
        console.log("Token saved run artist command to get artist info");
    });
});
program
    .command("artist")
    .description("Get artist info")
    .arguments("<artist>")
    .action((artist) => {
    function getArtistInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`, {
                method: "GET",
                headers: { Authorization: "Bearer " + node_process_1.default.env.Token },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! did you add API key and secret?
      https://developer.spotify.com/documentation/web-api/concepts/apps
      `);
            }
            return yield response.json();
        });
    }
    getArtistInfo().then((profile) => {
        console.log(profile.artists.items);
    });
});
program.parse();
