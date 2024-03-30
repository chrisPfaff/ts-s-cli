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
const { exec } = require("child_process");
const fs_1 = __importDefault(require("fs"));
const showImage = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const imagePath = fs_1.default.readFileSync(path);
    console.log(imagePath);
    //   exec(`imgcat ${imagePath}`, (error: any, stdout: any, stderr: any) => {
    //     if (error) {
    //       console.error(`exec error: ${error}`);
    //       return;
    //     }
    //     console.log(`stdout:\n${stdout}`);
    //     console.error(`stderr:\n${stderr}`);
    //   });
});
exports.default = showImage;
