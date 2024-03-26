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
const yargs_1 = __importDefault(require("yargs/yargs"));
const argv = (0, yargs_1.default)(node_process_1.default.argv).argv;
(() => {
    function getToken() {
        return __awaiter(this, void 0, void 0, function* () {
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
            return yield response.json();
        });
    }
    function getArtistInfo(access_token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`https://api.spotify.com/v1/search?q=${name}&type=artist&limit=1`, {
                method: "GET",
                headers: { Authorization: "Bearer " + access_token },
            });
            return yield response.json();
        });
    }
    getToken().then((response) => {
        getArtistInfo(response.access_token, argv.name).then((profile) => {
            console.log(profile.artists.items);
        });
    });
})();
