
const symbols = {
  el: Symbol('el'),
  observed: Symbol('observed')
}

module.exports.symbols = symbols

module.exports.Component = class Component extends window.HTMLElement {
  connectedCallback () {
    if (this._properties != null) {
      _initProps.call(this)
    }
    this[symbols.el] = this.shadow ? this.attachShadow({mode: 'open'}) : this
    this.preRenderCallback()
    this._render()
    this.postRenderCallback()
  }

  engineRender (styles, template, el) {
    if (styles != null) {
      el.appendChild(styles)
    }
    if (template != null) {
      el.appendChild(template)
    }
  }

  _render () {
    let styles = document.createElement('style')
    styles.innerHTML = this.styles() || ''
    styles = this.styled ? styles : undefined
    let template = this.visual ? this.render() : undefined
    if (!this.logical) {
      this.engineRender(styles, template, this[symbols.el])
    }
  }

  update () {
    this._render()
  }

  static get observedAttributes () {
    return this.prototype[symbols.observed] || []
  }

  get node () {
    return this[symbols.el]
  }
  
  get shadow () {
    return true
  }

  get visual () {
    return true
  }

  get styled () {
    return true
  }

  get logical () {
    return false
  }

  attributeChangedCallback () {
    if (this[symbols.el] != null) {
      this._render()
    }
  }

  styles () {
    return `
      :host {
        display: block;
      }  
    `
  }

  render () {}

  preRenderCallback () {}

  postRenderCallback () {}
  
  $ (query) {
    return this.node.querySelector(query)
  }

  listen (query, event, fn) {
    this.$(query).addEventListener(event, fn)
  }

  log (...args) {
    console.log(this.constructor.is, ...args)
  }
}

module.exports.tag = function (name) {
  return (Class) => {
    Class.__defineGetter__('is', () => name)
    if(typeof window.customElements.get(name) === 'undefined') {
      window.customElements.define(name, Class)
    }
  }
}

function _initProps () {
  Object.keys(this._properties).forEach((name) => {
    const prop = this._properties[name].type.toLowerCase() === 'boolean' ?
      this.getAttribute(name) : this[name]
    if (prop != null) {
      this[name] = this[name]
    } else {
      const defaultValue = this._properties[name].value
      if (defaultValue != null) {
        this[name] = typeof defaultValue === 'function' ? defaultValue() : defaultValue
      }
    }
  })
}

function _parseAttribute (value, type) {
  switch (type) {
    case 'number':
      return value != null ? Number(value) : null
    case 'boolean':
      return value != null ? true : false
    case 'string':
    default:
      return value
  }
}

function _parseProperty (self, key, value, type) {
  switch (type) {
    case 'boolean':
      return value === true ? self.setAttribute(key, '') : self.removeAttribute(key)
    case 'number':
    case 'string':
    default:
      return self.setAttribute(key, value)
  }
}

module.exports.props = function (config) {
  return function (Class) {
    Object.defineProperty(Class.prototype, '_properties', {
      get () {
        return config
      }
    })

    Object.keys(config).forEach((key) => {
      let prop = config[key]
      let sym = Symbol(key)
      let type = prop.type || 'string'
      type = type.toLowerCase()
      let observe = prop.observe
      let defaultValue = prop.value
      const debug = prop.debug || false

      if (type !== 'object' && observe === true) {
        Class.prototype[symbols.observed] = Class.prototype[symbols.observed] || []
        Class.prototype[symbols.observed].push(key)
      }

      Object.defineProperty(Class.prototype, key, {
        get () {
          if (debug === true) {
            this.log('getting', key)
          }
          if (type === 'object') {
            const value = this[sym]
            return typeof value !== 'undefined' ? value :
              typeof defaultValue === 'function' ? defaultValue() : defaultValue
          } else {
            const value = _parseAttribute(this.getAttribute(key), type)
            return value != null ? value :
              typeof defaultValue === 'function' ? defaultValue() : defaultValue
          }
        },

        set (value) {
          if (debug === true) {
            this.log('setting', key, 'to', value)
          }
          
          if (type === 'object') {
            this[sym] = value
            if (observe === true) {
              this.attributeChangedCallback(key)
            }
          } else {
            _parseProperty(this, key, value, type)
          }
        }
      })
    })
  }
}

module.exports.styles = function (fn) {
  return function (Class) {
    Class.prototype.styles = function () {
      return fn(this)
    }
  }
}

function _getProp (prop) {
  return function (value) {
    return (Class) => {
      Class.prototype.__defineGetter__(prop, () => value)
    }
  }
}

module.exports.shadow = _getProp('shadow')
module.exports.visual = _getProp('visual')
module.exports.styled = _getProp('styled')
module.exports.logical = _getProp('logical')

