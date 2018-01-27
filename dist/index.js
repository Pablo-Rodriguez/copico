'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var symbols = {
  el: Symbol('el'),
  observed: Symbol('observed')
};

module.exports.symbols = symbols;

module.exports.Component = function (_window$HTMLElement) {
  _inherits(Component, _window$HTMLElement);

  function Component() {
    _classCallCheck(this, Component);

    return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).apply(this, arguments));
  }

  _createClass(Component, [{
    key: 'connectedCallback',
    value: function connectedCallback() {
      if (this._properties != null) {
        _initProps.call(this);
      }
      this[symbols.el] = this.shadow ? this.attachShadow({ mode: 'open' }) : this;
      this.preRenderCallback();
      this._render();
      this.postRenderCallback();
    }
  }, {
    key: 'engineRender',
    value: function engineRender(styles, template, el) {
      if (styles != null) {
        el.appendChild(styles);
      }
      if (template != null) {
        el.appendChild(template);
      }
    }
  }, {
    key: 'parseStyles',
    value: function parseStyles(styles) {
      var $styles = document.createElement('style');
      $styles.innerHTML = styles;
      return $styles;
    }
  }, {
    key: '_render',
    value: function _render() {
      var styles = this.styled ? this.parseStyles(this.styles()) : undefined;
      var template = this.visual ? this.render() : undefined;
      if (!this.logical) {
        this.engineRender(styles, template, this[symbols.el]);
      }
    }
  }, {
    key: 'update',
    value: function update() {
      this._render();
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback() {
      if (this[symbols.el] != null) {
        this._render();
      }
    }
  }, {
    key: 'styles',
    value: function styles() {
      return '\n      :host {\n        display: block;\n      }  \n    ';
    }
  }, {
    key: 'render',
    value: function render() {}
  }, {
    key: 'preRenderCallback',
    value: function preRenderCallback() {}
  }, {
    key: 'postRenderCallback',
    value: function postRenderCallback() {}
  }, {
    key: '$',
    value: function $(query) {
      return this.node.querySelector(query);
    }
  }, {
    key: 'listen',
    value: function listen(query, event, fn) {
      this.$(query).addEventListener(event, fn);
    }
  }, {
    key: 'log',
    value: function log() {
      var _console;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_console = console).log.apply(_console, [this.constructor.is].concat(args));
    }
  }, {
    key: 'node',
    get: function get() {
      return this[symbols.el];
    }
  }, {
    key: 'shadow',
    get: function get() {
      return true;
    }
  }, {
    key: 'visual',
    get: function get() {
      return true;
    }
  }, {
    key: 'styled',
    get: function get() {
      return true;
    }
  }, {
    key: 'logical',
    get: function get() {
      return false;
    }
  }], [{
    key: 'observedAttributes',
    get: function get() {
      return this.prototype[symbols.observed] || [];
    }
  }]);

  return Component;
}(window.HTMLElement);

module.exports.tag = function (name) {
  return function (Class) {
    Class.__defineGetter__('is', function () {
      return name;
    });
    if (typeof window.customElements.get(name) === 'undefined') {
      window.customElements.define(name, Class);
    }
  };
};

function _initProps() {
  var _this2 = this;

  Object.keys(this._properties).forEach(function (name) {
    var prop = _this2._properties[name].type.toLowerCase() === 'boolean' ? _this2.getAttribute(name) : _this2[name];
    if (prop != null) {
      _this2[name] = _this2[name];
    } else {
      var defaultValue = _this2._properties[name].value;
      if (defaultValue != null) {
        _this2[name] = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
    }
  });
}

function _parseAttribute(value, type) {
  switch (type) {
    case 'number':
      return value != null ? Number(value) : null;
    case 'boolean':
      return value != null ? true : false;
    case 'string':
    default:
      return value;
  }
}

function _parseProperty(self, key, value, type) {
  switch (type) {
    case 'boolean':
      return value === true ? self.setAttribute(key, '') : self.removeAttribute(key);
    case 'number':
    case 'string':
    default:
      return self.setAttribute(key, value);
  }
}

module.exports.props = function (config) {
  return function (Class) {
    Object.defineProperty(Class.prototype, '_properties', {
      get: function get() {
        return config;
      }
    });

    Object.keys(config).forEach(function (key) {
      var prop = config[key];
      var sym = Symbol(key);
      var type = prop.type || 'string';
      type = type.toLowerCase();
      var observe = prop.observe;
      var defaultValue = prop.value;
      var debug = prop.debug || false;

      if (type !== 'object' && observe === true) {
        Class.prototype[symbols.observed] = Class.prototype[symbols.observed] || [];
        Class.prototype[symbols.observed].push(key);
      }

      Object.defineProperty(Class.prototype, key, {
        get: function get() {
          if (debug === true) {
            this.log('getting', key);
          }
          if (type === 'object') {
            var value = this[sym];
            return typeof value !== 'undefined' ? value : typeof defaultValue === 'function' ? defaultValue() : defaultValue;
          } else {
            var _value = _parseAttribute(this.getAttribute(key), type);
            return _value != null ? _value : typeof defaultValue === 'function' ? defaultValue() : defaultValue;
          }
        },
        set: function set(value) {
          if (debug === true) {
            this.log('setting', key, 'to', value);
          }

          if (type === 'object') {
            this[sym] = value;
            if (observe === true) {
              this.attributeChangedCallback(key);
            }
          } else {
            _parseProperty(this, key, value, type);
          }
        }
      });
    });
  };
};

module.exports.styles = function (fn) {
  return function (Class) {
    Class.prototype.styles = function () {
      return fn(this);
    };
  };
};

function _getProp(prop) {
  return function (value) {
    return function (Class) {
      Class.prototype.__defineGetter__(prop, function () {
        return value;
      });
    };
  };
}

module.exports.shadow = _getProp('shadow');
module.exports.visual = _getProp('visual');
module.exports.styled = _getProp('styled');
module.exports.logical = _getProp('logical');
