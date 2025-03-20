import fs from "node:fs"
import path from "path"
import * as esbuild from "esbuild";



// Read the module that is generated for each HTML template
const templateModulePath = new URL("./output/html-template/module.js", import.meta.url).pathname;
const templateModule = await fs.promises.readFile(templateModulePath, "utf8");

// The path of the helper-functions.js file
const helperFunctionsPath = new URL("./output/html-template/helper-functions.js", import.meta.url).pathname;


export default {
    /**
     * Builds the templates into an module with a .renderTemplate function
     * @param {String} templateFolder The path to a directory with HTML templates
     * @param {String} outputFile The path where the build should be saved
     * @param {Object} options Object with the options for the build
     * @returns {Promise<Boolean>} True if the build was successful, false otherwise
     */
    async build(templateFolder, outputFile, options = {}) {
        // Check if the template folder exists and is indeed a directory
        const absoluteTemplateFolder = path.resolve(process.cwd(), templateFolder);
        if(!(await fs.promises.stat(absoluteTemplateFolder)).isDirectory()) {
            throw new Error(`Template folder is not a valid directory: '${templateFolder}'`);
        }

        const forgeTemplatesPlugin = {
            name: "ForgeTemplates",
            setup(build) {
                build.onResolve({ filter: /internal:.+/ }, args => {
                    return {
                        path: args.path.split(":").splice(1).join(":"),
                        namespace: "ForgeTemplates"
                    }
                });
        
        
                build.onLoad({ namespace: "ForgeTemplates", filter: /.*/ }, async args => {
                    // Get all files in the template folder (and sub-folders)
                    const allTemplates = await fs.promises.readdir(absoluteTemplateFolder, { withFileTypes: true, recursive: true });

                    // Go through all files and build the js script and name-to-module object
                    let contents = "";
                    const templateNames = {};
                    for(let i = 0; i < allTemplates.length; i++) {
                        const file = allTemplates[i];
        
                        // Check if this file is a template HTML file
                        if(file.isFile() && file.name.endsWith(".tmpl.html")) {
                            const fullTemplatePath = file.parentPath + "/" + file.name;
                            const templateName = fullTemplatePath.replace(absoluteTemplateFolder + "/", "").replace(/\.tmpl\.html$/, "");
                            templateNames[templateName] = "template" + i;
                            contents += `import * as template${i} from "${fullTemplatePath}"\n`
                        }
                    }
        
                    // Add the name-to-module object to the js script
                    const innerJson = Object.entries(templateNames).map(([key, value]) => `"${key}":${value}`).join(",");
                    contents += `export const templateModules = { ${innerJson} }`;
        
                    return {
                        contents,
                        loader: "js",
                        resolveDir: templateFolder
                    }
                });
        
        
                build.onLoad({ filter: /\.tmpl\.html$/ }, async args => {
                    let html = await fs.promises.readFile(args.path, "utf8");
                    
                    // Very basic minifier for HTML
                    if(options.minify_html) {
                        html = html.replace(/>\s+</g, "><").trim();
                    }
        
                    return {
                        contents: templateModule.replace("{{PATH}}", helperFunctionsPath).replace("{{HTML}}", html),
                        loader: "js",
                    }
                });
            }
        }

        await esbuild.build({
            entryPoints: [new URL("./output/renderer.js", import.meta.url).pathname],
            bundle: true,
            minify: true,
            format: "esm",
            outfile: outputFile,
            logLevel: "silent",
            plugins: [forgeTemplatesPlugin],
            banner: {
                js: "/* Generated by https://www.npmjs.com/package/forge-templates */"
            }
        });
    }
}