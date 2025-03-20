/**
 * This is the file that will be spit out after being built. The templates will be
 * imported from the "internal:modules" import.
 */

import { templateModules } from "internal:modules"


/**
 * Renders a specific template with the given data
 * @param {String} name The name of the template
 * @param {*} data The data object to pass to the template
 * @returns {String} The HTML fully rendered
 */
export function renderTemplate(name, data) {
    if(!templateModules[name]) {
        throw new Error(`No such HTML template: '${name}'`);
    }

    // Get the HTML as array of dynamic and static string blocks
    const htmlArray = templateModules[name].getHTML(data);

    // Check if this template extends anything
    let extendsTemplate;
    for(const part of htmlArray) {
        if(!part.static) {
            const extendMatch = part.value.match(/^{{\s*extend\s+(\w+)\s*}}$/);
            if(extendMatch) {
                extendsTemplate = extendMatch[1];
                break;
            }
        }
    }

    // If there is no inheritance, remove the block tags and return HTML
    if(!extendsTemplate) {
        return removeBlockTags(htmlArray).map(part => part.value).join("");
    }

    // Make sure the template we want to extend from exists
    if(!templateModules[extendsTemplate]) {
        throw new Error(`No such HTML template to extend from: '${templateResponse.extendsTemplate}'`);
    }
    
    // The template extends a base template, so extract the content blocks
    const blocks = extractBlocks(htmlArray);

    const baseTemplateArray = templateModules[extendsTemplate].getHTML(data);
    replaceBlocks(baseTemplateArray, blocks);

    return baseTemplateArray.map(part => part.value).join("");
}



/**
 * Extracts the content blocks from the HTML
 * @param {Array<Object>} htmlArray An array with HTML string parts
 * @returns {Object} Object that maps the name of a block to its content
 */
function extractBlocks(htmlArray) {
    // Extract the blocks from the template
    const blocks = {};
    let currentBlockName;
    let currentBlockValue = "";
    for(const part of htmlArray) {
        // Static part of the HTML template
        if(part.static) {
            if(currentBlockName) {
                currentBlockValue += part.value;
            }

        // Dynamic part, check if content block end
        } else if(/^{{\s*end\s*}}$/.test(part.value)) {
            part.value = "";
            if(currentBlockName) {
                blocks[currentBlockName] = currentBlockValue;
            }
            currentBlockName = null;
            currentBlockValue = "";

        // If not end, check if it's a content block start
        } else {
            const beginBlockMatch = part.value.match(/^{{\s*(\w+)\s*}}$/);
            if(beginBlockMatch) {
                part.value = "";
                currentBlockName = beginBlockMatch[1];
                currentBlockValue = "";

            // It wasn't a block start/end, so just add it to the block content if we're in a block
            } else if(currentBlockName){
                currentBlockValue += part.value;
            }
        }
    }

    return blocks;
}



/**
 * Sets all parts that are content block tags, to an emptry string, effectively removing the tags
 * @param {Array<Object>} htmlArray An array with HTML string parts
 * @returns {Array<Object>} The htmlArray that was given
 */
function removeBlockTags(htmlArray) {
    for(const part of htmlArray) {
        if(!part.static && /^{{\s*\w+\s*}}$/.test(part.value)) {
            part.value = "";
        }
    }

    return htmlArray;
}



/**
 * Replaces the content blocks in the HTML array with the given content blocks
 * @param {Array<Object>} htmlArray An array with HTML string parts
 * @param {Object} blocks Object that maps the name of a block to its content
 */
function replaceBlocks(htmlArray, blocks) {
    let waitingOnBlockEnd = false;

    for(const part of htmlArray) {
        if(!part.static) {
            if(waitingOnBlockEnd) {
                if(/^{{\s*end\s*}}$/.test(part.value)) {
                    waitingOnBlockEnd = false;
                }
                part.value = "";
            } else {
                // Replace the content block start with the child block if we find such a part
                const beginBlockMatch = part.value.match(/^{{\s*(\w+)\s*}}$/);
                if(beginBlockMatch) {
                    if(blocks[beginBlockMatch[1]]) {
                        part.value = blocks[beginBlockMatch[1]];
                        waitingOnBlockEnd = true;

                    // Otherwise, just remove any block indicators (start/end/extend)
                    } else {
                        part.value = "";
                    }
                }
            }
        
        // If we're at a static part
        } else if(waitingOnBlockEnd) {
            part.value = "";
        }
    }
}
