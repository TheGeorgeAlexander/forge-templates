#!/usr/bin/env node

import ForgeTemplates from "./forge.js"


// Map for ANSI escape codes in the terminal
const ANSI = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    brightWhite: "\x1b[97m",

    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    bgGray: "\x1b[100m",
    bgBrightRed: "\x1b[101m",
    bgBrightGreen: "\x1b[102m",
    bgBrightYellow: "\x1b[103m",
    bgBrightBlue: "\x1b[104m",
    bgBrightMagenta: "\x1b[105m",
    bgBrightCyan: "\x1b[106m",
    bgBrightWhite: "\x1b[107m",

    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    italic: "\x1b[3m",
    underline: "\x1b[4m",
    blink: "\x1b[5m",
    inverse: "\x1b[7m",
    hidden: "\x1b[8m",
    strikethrough: "\x1b[9m"
};


// Get the given arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log(`
Usage: ${ANSI.green}forge-templates <folder> <file> [options...]${ANSI.reset}
Parameters:
    ${ANSI.green}folder${ANSI.reset}            The folder with your template files
    ${ANSI.green}file${ANSI.reset}              Location to save the built script to, a JavaScript file
Options:
    ${ANSI.green}--minify-html${ANSI.reset}     Enables a basic HTML minifier to make the output script smaller
`);
    process.exit(1);
}

// Parse the options in the command into an options object
const options = {};
for(let i = 2; i < args.length; i++) {
    if(args[i].toLowerCase() == "--minify-html") {
        options.minify_html = true;
    }
}

// Build the templates
try {
    await ForgeTemplates.build(args[0], args[1], options);
} catch(e) {
    console.log("Build not successful!\n");
    console.error(e.message)
    process.exit(1);
}

console.log(`Build successful!

Example usage in JavaScript:
  ${ANSI.gray}1| ${ANSI.yellow}import ${ANSI.brightMagenta}ForgeTemplates ${ANSI.yellow}from ${ANSI.green}"${args[1]}"${ANSI.white};
  ${ANSI.gray}2|
  ${ANSI.gray}3| ${ANSI.cyan}const ${ANSI.brightMagenta}data ${ANSI.yellow}= { ${ANSI.white}...... ${ANSI.yellow}}${ANSI.white};
  ${ANSI.gray}4| ${ANSI.cyan}const ${ANSI.brightMagenta}renderedHTML ${ANSI.yellow}= ${ANSI.magenta}ForgeTemplates${ANSI.white}.${ANSI.blue}renderTemplate${ANSI.yellow}(${ANSI.green}"<name>"${ANSI.white}, ${ANSI.magenta}data${ANSI.yellow})${ANSI.white};${ANSI.reset}
`);
