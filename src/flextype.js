function _type(v) {
  if (v === null) return 'null'
  if (v === void 0) return 'undefined'
  const t = typeof v
  if (t === 'number' && isNaN(v)) return 'nan'
  if (t === 'object') {
    if (Array.isArray(v)) return 'array'
    if (v instanceof Date) return 'date'
    if (v instanceof RegExp) return 'regexp'
  }
  return t
}

function _convert(v, t, o) {
  if (o.typeLock) return [v, t]
  if (t === 'string' && !o.stringLock) {
    const s = v.trim()
    if (s === '') return [v, t]
    const l = s.toLowerCase()
    if (l === 'true') return [true, 'boolean']
    if (l === 'false') return [false, 'boolean']
    if (!isNaN(s) && s !== '') { const n = Number(s); if (isFinite(n)) return [n, 'number'] }
    const f = s[0], e = s[s.length - 1]
    if ((f === '{' && e === '}') || (f === '[' && e === ']')) {
      try { const j = JSON.parse(s); return [j, Array.isArray(j) ? 'array' : 'object'] } catch {}
    }
    return [v, t]
  }
  if (t === 'boolean' && o.boolLock) return [v ? 1 : 0, 'boolean']
  return [v, t]
}

export class FlexType {
  constructor(value, name = 'unknown', options = {}) {
    if (value instanceof FlexType) value = value._v
    this._r = value
    this._n = name
    this._o = options
    this._t = _type(value)
    ;[this._v, this._t] = _convert(value, this._t, options)
  }

  get value() { return this._v }

  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return String(this._v)
    return this._v
  }
  get type() { return this._t }
  get name() { return this._n }
  get isLocked() { return !!(this._o.stringLock || this._o.boolLock || this._o.typeLock) }

  isString() { return this._t === 'string' }
  isNumber() { return this._t === 'number' }
  isBoolean() { return this._t === 'boolean' }
  isArray() { return this._t === 'array' }
  isObject() { return this._t === 'object' }
  isNull() { return this._t === 'null' }
  isUndefined() { return this._t === 'undefined' }

  strLock() { return new FlexType(this._r, this._n, { ...this._o, stringLock: true }) }
  boolLock() { return new FlexType(this._r, this._n, { ...this._o, boolLock: true }) }
  typeLock() { return new FlexType(this._r, this._n, { ...this._o, typeLock: true }) }
  unlock() { return new FlexType(this._r, this._n, {}) }

  _math(op, other) {
    const ov = other instanceof FlexType ? other._v : other
    if (this._o.stringLock && this._t === 'string') throw Error(`String locked '${this._n}' cannot do math`)
    let a = this._v
    if (this._o.boolLock && this._t === 'boolean') a = a ? 1 : 0
    let r
    switch (op) {
      case '+': r = a + ov; break
      case '-': r = a - ov; break
      case '*': r = a * ov; break
      case '/': r = a / ov; break
    }
    if (this._o.boolLock && this._t === 'boolean') r = r > 1 ? 1 : r < 0 ? 0 : r
    return new FlexType(r, `(${this._n} ${op} ${other instanceof FlexType ? other._n : 'literal'})`)
  }

  add(other) { return this._math('+', other) }
  subtract(other) { return this._math('-', other) }
  multiply(other) { return this._math('*', other) }
  divide(other) { return this._math('/', other) }

  get(prop) {
    if (this._t !== 'array' && this._t !== 'object') throw Error(`get() requires array/object, got ${this._t}`)
    return new FlexType(this._v[prop], `${this._n}[${prop}]`)
  }

  set(prop, val) {
    if (this._t !== 'array' && this._t !== 'object') throw Error(`set() requires array/object, got ${this._t}`)
    this._v[prop] = val instanceof FlexType ? val._v : val
    return this
  }

  push(...items) {
    if (this._t !== 'array') throw Error(`push() requires array, got ${this._t}`)
    this._v.push(...items.map(i => i instanceof FlexType ? i._v : i))
    return this
  }

  toString() { return new FlexType(String(this._v), `String(${this._n})`, { typeLock: true }) }
  toNumber() { return new FlexType(Number(this._v), `Number(${this._n})`, { typeLock: true }) }
  toBoolean() { return new FlexType(Boolean(this._v), `Boolean(${this._n})`, { typeLock: true }) }

  debug() {
    return { name: this._n, value: this._v, type: this._t, raw: this._r, options: { ...this._o }, isLocked: this.isLocked }
  }
}

export function flex(name, value, options = {}) {
  if (typeof name !== 'string') throw Error('Variable name must be a string')
  return new FlexType(value, name, options)
}

export function declareFlex(variables, options = {}) {
  const r = {}
  for (const [k, v] of Object.entries(variables)) r[k] = new FlexType(v, k, options)
  return r
}

export default { FlexType, flex, declareFlex }
