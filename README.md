# Forge Templates
Forge Templates is library for rendering dynamic HTML templates with embedded server-side JavaScript.
The templates fully support JavaScript by being embedded into a script at build time. You build the templates into a 
script with the `forge-templates` CLI or using `ForgeTemplates.build(....)` in your own build script.

### Features
- Full JavaScript support in the templates, without using `eval`, `new Function` or similar functions
- Template inheritance, a template can extend a base template and replace its defined content blocks (see [Tempalte Inheritance](#template-inheritance))
- Helper functions make it easy to render an array of data, or execute arbitrary JavaScript in a template (see [Helper Functions](#helper-functions))
- Building can be done with the CLI, or programmatically with the JavaScript API (see [Building the Templates](#building-the-templates))
- After building, it requires no Node.js or Web APIs, so it's compatible with all execution environments


### Sections
- [Example](#example)
- [Template Format](#template-format)
  - [Passing Data](#passing-data)
  - [Template Inheritance](#template-inheritance)
  - [Helper Functions](#helper-functions)
- [Building the Templates](#building-the-templates)
  - [Command Line Interface (CLI)](#command-line-interface-cli)
  - [JavaScript API](#javascript-api)

## Example
Template file: `src/templates/names.tmpl.html`
```html
<html lang="en">
    <head>
        <title>${data.title}</title>
    </head>
    <body>
        <h1>${data.title}</h1>
        <p>${data.description}</p>
        <ul>
            ${forEach(data.names, (name, index) => {
                return `<li>Name ${index}: ${name}</li>`;
            })}
        </ul>
    </body>
</html>
```

Build the templates: `CLI`
```
forge-templates src/templates build/forge-build.js --minify-html
```

Rendering: `index.js`
```js
import { renderTemplate } from "build/forge-build.js";

const renderedHTML = renderTemplate("names", {
    title: "The Names",
    description: "This page contains a dynamically generated list of names!",
    names: ["Mary", "John", "Kath", "George"]
});

console.log(renderedHTML);

/* Output:

<html lang="en">
    <head>
        <title>The Names</title>
    </head>
    <body>
        <h1>The Names</h1>
        <p>This page contains a dynamically generated list of names!</p>
        <ul>
            <li>Name 0: Mary</li>
            <li>Name 1: John</li>
            <li>Name 2: Kath</li>
            <li>Name 3: George</li>
        </ul>
    </body>
</html>

(Whitespace has been manually added for readability)
*/
```



## Template Format
A template is normal HTML, but with embedded JavaScript that lives in `${}`, in the same way that
[template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) work in
JavaScript. A template is **required** to have `.tmpl.html` as file extension. Normal `.html` files will not be recognised
as templates during the build stage.

### Passing Data
In a template there is a global variable `data` exposed. This is exactly what you pass in the
`renderTemplate("<name>", data)` function. In general, a simple object with strings or other basic data types is
recommended, however, this is not strictly enforced.

### Template Inheritance
It is not uncommon to have shared elements between pages, for example a navbar or footer. This is easily done by
extending a base template. A key element to understand inheritance are content blocks. A content block starts with a
name and ends at the end tag. The start of a block has the format `${"{{ <NAME> }}"}` where `<NAME>` is the name of
the content block. The end tag of a content block is `${"{{ end }}"}`. Whitespace between the tag identifiers is
optional. An example of a base template with content blocks is below.

`base-template.tmpl.html`
```html
<html lang="en">
    <head>
        ${"{{ html_head }}"}${"{{ end }}"}
    </head>

    <body>
        {"{{ content }}"}
        <p>This will be removed if a template extends this one and overrides the "content" content block</p>
        {"{{ end }}"}
    </body>
</html>
```

To extend this template you add `${"{{ extend <NAME> }}"}`. The template above may be extended like so.

`contact.tmpl.html`
```html
${"{{ extend base-template }}"}


${"{{ html_head }}"}
<link rel="stylesheet" href="/assets/contact.css">
${"{{ end }}"}

${"{{ content }}"}
<p>Contact us at mail@example.com</p>
${"{{ end }}"}
```

Rendering the `contact` template would result into the following output.
```html
<html lang="en">
    <head>
        <link rel="stylesheet" href="/assets/contact.css">
    </head>

    <body>
        <p>Contact us at mail@example.com</p>
    </body>
</html>
```


### Helper Functions
There are a few helpful utility functions available in templates. 

The first is `forEach`. It loops through the given array and executes the given callback for every item, which should
map the values to strings that will be inserted into the template.

`forEach(array, callback)`

Example:
```html
<ul>
    ${forEach(data.someArray, (itemOfArray, index, theArray) => {
        return `<li>The item is: ${itemOfArray}</li>`;
    })}
</ul>
```

The second helper function is `execute`. This is a function designed to allow for arbitrary JavaScript execution in the
template. The given callback is executed during rendering and the given `echo` function in the callback can be used
to have HTML output.

`execute(callback)`

Example:
```html
<ul>
    ${execute(echo => {
        for(let i = 0; i < 5; i++) {
            echo(`<li>Random number ${i+1}: ${Math.random()}</li>`);
        }

        // If the callback returns a string, it will also be rendered in the HTML (optional)
        return `<li>This is the end of the list!</li>`
    })}
</ul>
```



## Building the Templates
To be able to access the `renderTemplate` function, you have to build the templates into a single script. There are two
ways you can build the templates. You can either use the CLI or the JavaScript API. 

### Command Line Interface (CLI)
Building the templates through the CLI is easy. After installing this package, the `forge-templates` should automatically
be available in your terminal. Use the CLI as follows.
```
Usage: forge-templates <folder> <file> [options...]
Parameters:
    folder            The folder with your template files
    file              Location to save the built script to, a JavaScript file
Options:
    --minify-html     Enables a basic HTML minifier to make the output script smaller
```

### JavaScript API
To assist with more automated ways of building the templates, you can also build by calling a function in JavaScript.
An example of this is below.
```js
import ForgeTemplates from "forge-templates"

// Options are optional
const options = {
    minify_html: true
}
ForgeTemplates.build("<folder>", "<file>", options);
```