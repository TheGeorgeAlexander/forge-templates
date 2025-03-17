/**
 * Every HTML template file is converted to this module at build time.
 * The HTML template is embedded at the placeholder. The import placeholder is replaced with the correct
 * path to the shared-functions.js folder.
 */
import { convertToSingleArray, extractBlocks, replaceBlocks, forEach, execute } from "{{PATH}}";


export function render(data, child_blocks) {
    // The actual HTML template will be injected in this template string
    const htmlArray = convertToSingleArray`{{HTML}}`;
    
    let extendsTemplate, blocks;

    // If there are child blocks, this means this template was extended
    if(child_blocks) {
        replaceBlocks(htmlArray, child_blocks);

    // No child blocks, so check if this template extends anything
    } else {
        for(const part of htmlArray) {
            if(!part.static) {
                const extendMatch = part.value.match(/^{{\s*extend\s+(\w+)\s*}}$/);
                if(extendMatch) {
                    extendsTemplate = extendMatch[1];
                    break;
                }
            }
        }

        // Extract the content blocks
        blocks = extractBlocks(htmlArray)
    }

    // Collapse the array into a single HTML string
    const html = htmlArray.map(part => part.value).join("");
    return { html, blocks, extendsTemplate };
}
