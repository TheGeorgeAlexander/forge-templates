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
    const templateResponse = templateModules[name].render(data, null);

    // If the template does not extend a template, just return the rendered HTML
    if(!templateResponse.extendsTemplate) {
        return templateResponse.html;
    }

    // Otherwise, render the base template and return that one
    if(!templateModules[templateResponse.extendsTemplate]) {
        throw new Error(`No such HTML template to extend from: '${templateResponse.extendsTemplate}'`);
    }
    const baseTemplateResponse = templateModules[templateResponse.extendsTemplate].render(data, templateResponse.blocks);
    return baseTemplateResponse.html;
}
