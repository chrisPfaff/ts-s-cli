#!/usr/bin/env node
const { exec } = require("child_process");

const showImage = async (path: string) => {
  console.log("show image", path);
  exec(`imgcat ${path}`);
};

export default showImage;
