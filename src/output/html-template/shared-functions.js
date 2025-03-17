/**
 * To prevent these functions to be embedded into the module of every template, thus
 * being duplicated multiple times, they were put in this file.
 */


/**
 * Template tag function to get a single array of static and dynamic string elements.
 * @param {Array<String>} strings Array of the static string elements
 * @param  {...String} values The evaluated dynamic string elements
 * @returns {Array<Object>} A single array with different parts of the template string
 */
export function convertToSingleArray(strings, ...values) {
    const finalArray = [];

    for(let i = 0; i < strings.length; i++) {
        finalArray.push({
            value: strings[i],
            static: true
        });
        finalArray.push({
            value: values[i] == undefined ? "" : values[i],
            static: false
        });
    }

    return finalArray;
}



/**
 * Extracts the content blocks from the HTML
 * @param {Array<Object>} htmlArray An array with HTML string parts
 * @returns {Object} Object that maps the name of a block to its content
 */
export function extractBlocks(htmlArray) {
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
 * Replaces the content blocks in the HTML array with the given content blocks
 * @param {Array<Object>} htmlArray An array with HTML string parts
 * @param {Object} blocks Object that maps the name of a block to its content
 */
export function replaceBlocks(htmlArray, blocks) {
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



/**
 * Executes the callback for every item in the array and concatenates all return values
 * @param {Array} array The array to loop over
 * @param {Function} callback The function to execute, equivelant to the callback in Array.prototype.map()
 * @returns {String} The string for in the HTML
 */
export function forEach(array, callback) {
    return array.map(callback).join("");
}



/**
 * Executes arbitrary code with the possibility to echo strings to the HTML
 * @param {Function} func The user provided function
 * @returns {String} The string for in the HTML
 */
export function execute(func) {
    // The strings that were echo'd
    const echoTexts = [];

    // Execute the function, and store the return value
    const returnValue = func(text => { echoTexts.push(text) });

    // If the user function returned a string, make sure to also put it in the HTML
    if(typeof returnValue == "string") {
        echoTexts.push(returnValue);
    }

    // Return everything as one string
    return echoTexts.join("");
}