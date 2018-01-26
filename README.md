# copico
Pico web-component helper that uses ES7 decorators and can be configure to use any rendering library

## Install
Using yarn:
```sh
  $ yarn add copico
```

using npm:
```sh
  $ npm install --save copico
```

## How to use it
First thing you need to know is that, by default, copico is configured to just append the styles and the html to the component element (it doesn't matter if it uses shadow dom or not) but you can configured this in order to use copico with other libraries (lit-html for example).
```js
  import {Component as Copico} from 'copico'
  import {html, render} from 'lit-html'

  class Component extends Copico {
    engineRender (styles, template, el) {
      render(html`
        ${styles}
        ${template}
      `, el)
    }
  }

  // ...
  // Default behavior
  class Component {
    // ...
    engineRender (styles, template, el) {
      if (styles != null) {
        el.appendChild(styles)
      }
      if (template != null) {
        el.appendChild(template)
      }
    }
    // ...
  }
```

Once you have configured your Component class you can define web components like this:
```js
  import {tag, props, styles, shadow, visual, logical, styled} from 'copico'
  import {Component} from './our-custom-configuration.js'

  @tag('my-component') // registers the element in customElements
  @styles((self) => `
    :host {
      color: ${self.color};
    }
  `) // (First place to style) this will override Test.prototype.styles method
  @props({
    stringProp: {
      type: 'string', // prop type ['string', 'number', 'boolean', 'object']
      observe: true, // Whether to rerender or not when the property changes
      debug: true, // If true, A message will be log each time the property is get or set
      value: 'test prop' // default value
    },
    numberProp: {
      type: 'number'
    },
    booleanProp: {
      type: 'boolean'
    },
    objectProp: {
      type: 'object', // Object props won't be reflected to attributes
      value: () => {
        return {testProp: 3}
      } // you can also use functions that will be invoked to set default values
    }
  })
  @shadow(true) // Whether to use shadow dom or not. (default: true)
  @visual(true) // whether to render the template or not (default: true)
  @styled(true) // whether to render the styles or not (default: true)
  @logical(false) // If true, styles and render function will be called but neither of them will be rendered (no call to engineRender)
  class Test extends Component {
    render () {
      // default configuration
      return document.createElement('div')
      // lit-html configuration
      return html`
        <div></div>
      `
    }
    
    // Second place to style
    styles () {
      return `
        :host {
          color: ${this.color};
        }
      `
    }
  }
```

## Tests
To run the tests you just need to be sure all dependencies are installed and run
```sh
  $ yarn test
```
If you want to enable file watching:
```sh
  $ yarn test -w
```
