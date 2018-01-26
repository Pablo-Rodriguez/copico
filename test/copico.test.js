
import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'
import 'tap-dev-tool/register'
import test from 'tape'
import 'tape-chai'

import {
  default as copico,
  Component,
  tag,
  shadow,
  visual,
  styled,
  logical,
  props,
  styles
} from '../lib'
import {_, TestComponent, createPropTest} from './helpers'

test('Exports all', t => {
  t.ok(typeof copico.Component === 'function', 'Exports Component')
  t.ok(typeof copico.tag === 'function', 'Exports tag')
  t.ok(typeof copico.styles === 'function', 'Exports styles')
  t.ok(typeof copico.props === 'function', 'Exports props')
  t.ok(typeof copico.shadow === 'function', 'Exports shadow')
  t.ok(typeof copico.visual === 'function', 'Exports visual')
  t.ok(typeof copico.styled === 'function', 'Exports styled')
  t.ok(typeof copico.symbols === 'object', 'Exports symbols')
  t.end()
})

test('Can register element', t => {
  const name = _.name()

  t.equal(typeof customElements.get(name), 'undefined')
  
  @tag(name)
  class C extends Component {}
  const c = _.create(name)
  
  t.equal(customElements.get(name), C, 'Class registered with correct name')
  t.equal(C.is, name, 'Class static property \'is\' is equal to the component name')
  t.ok(c instanceof C, 'An element created with that name is an instance of the Class')
  t.ok(c instanceof HTMLElement, 'An element created with that name is an instance of HTMLELement')
  
  t.end()
})

test('Can be configure to render', t => {
  @tag(_.name())
  class C extends TestComponent {
    engineRender (styles, template, el) {
      t.ok(el instanceof ShadowRoot, 'The element is an instanceof shadow root (default render)')
      t.ok(styles instanceof HTMLElement, 'Styles is an HTMLElement')
      t.ok(template instanceof HTMLElement, 'Template is an HTMLElement')

      el.appendChild(styles)
      el.appendChild(template)
    }
  }

  const c = _.create(C.is)
  _.add(c)
  _.remove(c)

  t.end()
})

test('Whether to use SahdowDOM or not can be configured through decorator', t => {
  @tag(_.name())
  @shadow(true)
  class Shadow extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  class Light extends TestComponent {}

  @tag(_.name())
  class DefaultShadow extends TestComponent {}

  const $shadow = _.create(Shadow.is)
  const $light = _.create(Light.is)
  const $default = _.create(DefaultShadow.is)
  _.add($shadow, $light, $default)

  t.equal($shadow.shadow, true, 'shadow prop set to true when @shadow(true)')
  t.equal($light.shadow, false, 'shadow prop set to false when @shadow(false)')
  t.equal($default.shadow, true, 'shadow prop set to true by default')
  t.isNull(_.get('#test', $shadow), 'Cannot get elements in the shadow root')
  t.instanceOf(_.get('#test', $light), Object, 'Can get self-defined elements for they are not in the shadow DOM')
  t.isNull(_.get('#test', $default), 'Cannot get elements in the shadow root')

  _.remove($shadow, $light, $default)
  t.end()
})

test('Whether is a visual element or not can be changed with decorators', t => {
  @tag(_.name())
  @shadow(false)
  @visual(true)
  class Visible extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  @visual(false)
  class Invisible extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  class DefaultVisibility extends TestComponent {}

  const $visible = _.create(Visible.is)
  const $invisible = _.create(Invisible.is)
  const $default = _.create(DefaultVisibility.is)
  _.add($visible, $invisible, $default)

  t.equal($visible.visual, true, 'visual prop set to true when @visual(true)')
  t.equal($invisible.visual, false, 'visual prop set to false when @visual(false)')
  t.equal($default.visual, true, 'visual prop set to true by default')
  t.instanceOf(_.get('#test', $visible), Object, 'When visual, innerHTML is rendered')
  t.isNull(_.get('#test', $invisible), 'When no-visual, innerHTML is not renderd')
  t.instanceOf(_.get('#test', $default), Object, 'By default innerHTML is rendered')

  _.remove($visible, $invisible, $default)
  t.end()
})

test('Whether is styled or not can be configured with decorators', t => {
  @tag(_.name())
  @shadow(false)
  @styled(true)
  class Styled extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  @styled(false)
  class Unstyled extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  class DefaultStyled extends TestComponent {}

  const $styled = _.create(Styled.is)
  const $unstyled = _.create(Unstyled.is)
  const $default = _.create(DefaultStyled.is)
  _.add($styled, $unstyled, $default)

  t.equal($styled.styled, true, 'styled prop set to true when @styled(true)')
  t.equal($unstyled.styled, false, 'styled prop set to false when @styled(false)')
  t.equal($default.styled, true, 'styled prop set to true by default')
  t.instanceOf(_.get('style', $styled), Object, 'when styled, component has a style tag')
  t.isNull(_.get('style', $unstyled), 'when not styled, component has not a style tag')
  t.instanceOf(_.get('style', $default), Object, 'by default components are styled, so they do have a style tag')

  _.remove($styled, $unstyled, $default)
  t.end()
})

test('Wheter is a logical element or not can be configured with decorators', t => {
  @tag(_.name())
  @shadow(false)
  @logical(true)
  class Logical extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  @logical(false)
  class Visual extends TestComponent {}

  @tag(_.name())
  @shadow(false)
  class Default extends TestComponent {}

  const $logical = _.create(Logical.is)
  const $visual = _.create(Visual.is)
  const $default = _.create(Default.is)
  _.add($logical, $visual, $default)
  t.equal($logical.logical, true, 'logical prop set to false when @styled(false)')
  t.equal($visual.logical, false, 'logical prop set to true when @styled(true)')
  t.equal($default.logical, false, 'logical prop set to false by default')
  t.equal($logical.children.length, 0, 'when logical, the component doesn\'t have children')
  t.ok($visual.children.length > 0, 'when visual, the component has children')
  t.ok($default.children.length > 0, 'by default components are visual, so they do have children')

  _.remove($logical, $visual, $default)
  t.end()
})

test('Styling through decorators', t => {
  @styles((self) => `${self.prop}`)
  class Test {
    get prop () { return 'styles with prop' }
  }

  const test = new Test()
  t.equal(test.styles(), 'styles with prop', 'Styles method defined and correctly called')
  t.end()
})

test('Props with default values', t => {
  const Test = createPropTest({
    stringProp: {
      type: 'string',
      value: 'test prop'
    },
    booleanProp: {
      type: 'boolean',
      value: true
    },
    numberProp: {
      type: 'number',
      value: 5
    },
    objectProp: {
      type: 'object',
      value: () => ({test: true})
    }
  })
  const $test = _.create(Test.is)
  _.add($test)

  t.equal($test.stringProp, 'test prop', 'String attribute reflected to prop')
  t.equal($test.getAttribute('stringprop'), 'test prop', 'String prop accesible by attribute')
  t.equal($test.booleanProp, true, 'Boolean attribute reflected to prop')
  t.equal($test.getAttribute('booleanprop'), '', 'Boolean prop accesible by attribute')
  t.equal($test.numberProp, 5, 'Number attribute reflected to prop')
  t.equal($test.getAttribute('numberprop'), '5', 'Number prop accesible by attribute')
  t.deepEqual($test.objectProp, {test: true}, 'Object accesible by prop')
  t.isNull($test.getAttribute('objectprop'), 'Object prop cannot be accessed by attribute')

  _.remove($test)
  t.end()
})

test('Props can be reflected from prop to attr and from attr to prop', t => {
  const Test = createPropTest({
    stringProp: {type: 'string'},
    booleanProp: {type: 'boolean'},
    numberProp: {type: 'number'}
  })
  const $test = _.create(Test.is)
  _.add($test)

  t.isUndefined($test.stringProp, 'If not initialized string prop should be undefined')
  t.isNull($test.getAttribute('stringprop'), 'If not initialize string attribute should be null')
  $test.stringProp = 'test'
  t.equal($test.getAttribute('stringprop'), 'test', 'Property reflected to attribute')
  $test.setAttribute('stringprop', 'othertest')
  t.equal($test.stringProp, 'othertest', 'Attribute reflected to property')
  t.equal($test.booleanProp, false, 'If not initialize boolean prop should be false')
  t.isNull($test.getAttribute('booleanprop'), 'If not initialize boolean attribute should be null')
  $test.booleanProp = true
  t.equal($test.getAttribute('booleanprop'), '', 'Boolean prop reflected to attribute')
  $test.removeAttribute('booleanprop')
  t.equal($test.booleanProp, false, 'Boolean attribute reflected to property')
  t.isUndefined($test.numberProp, 'If not initialized number prop should be undefined')
  t.isNull($test.getAttribute('numberprop'), 'If not initialize number attribute should be null')
  $test.numberProp = 5
  t.equal($test.getAttribute('numberprop'), '5', 'Prop reflected to attribute')
  $test.setAttribute('numberprop', '5')
  t.equal($test.numberProp, 5, 'Attribute reflected to prop')

  _.remove($test)
  t.end()
})

test('Prop/attr change => rerender <=> prop.observe === true', t => {
  t.plan(2)
  let i = 0
  @tag(_.name())
  @logical(false)
  @props({
    prop: {
      type: 'number',
      observe: true,
      value: 5
    },
    unobserved: {
      type: 'number',
      observe: false,
      value: 2
    }
  })
  class Test extends TestComponent {
    render () {
      if (i === 0) {
        t.equal(this.prop, 5)
        i++
      } else if (i === 1) {
        t.equal(this.prop, 3)
      } else {
        t.fail('unobserved prop cannot lead to rerender')
      }
    }
  }
  const $test = _.create(Test.is)

  _.add($test)
  $test.prop = 3
  $test.unobserved = 4
  _.remove($test)
})

