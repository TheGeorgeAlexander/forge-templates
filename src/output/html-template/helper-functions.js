/**
 * To prevent these functions to be embedded into the module of every template, thus
 * being duplicated multiple times, they were put in this file.
 */


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
