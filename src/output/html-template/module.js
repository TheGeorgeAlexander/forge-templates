/**
 * Every HTML template file is converted to this module at build time.
 * The HTML template is embedded at the placeholder. The import placeholder is replaced with the correct
 * path to the helper-functions.js file.
 */
import { forEach, execute, renderIf } from "{{PATH}}";


export function getHTML(data) {
    // The actual HTML template will be injected in the template string
    return ((strings, ...values) => {
        const arr = [];
    
        for(let i = 0; i < strings.length; i++) {
            arr.push({
                value: strings[i],
                static: true
            });
            arr.push({
                value: values[i] == undefined ? "" : values[i],
                static: false
            });
        }
    
        return arr;
    })`{{HTML}}`;
}
