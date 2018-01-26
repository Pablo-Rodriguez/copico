
import uuid from 'uuid/v4'

import {Component, tag, shadow, props} from '../../lib'

export class _ {
  static name () {
    return `x-${uuid()}`
  }

  static create (name) {
    return document.createElement(name)
  }

  static get (what, where = document) {
    return where.querySelector(what)
  }

  static add (...args) {
    args.forEach(arg => document.body.appendChild(arg))
  }
  
  static remove (...args) {
    args.forEach(arg => arg.remove())
  }
}

export class TestComponent extends Component {
  render () {
    const div = _.create('div')
    div.setAttribute('id', 'test')
    return div
  }

  styles () {
    return ''
  }
}

export function createPropTest (config) {
  @tag(_.name())
  @shadow(false)
  @props(config)
  class Test extends TestComponent {}
  return Test
}

