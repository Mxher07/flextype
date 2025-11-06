'use strict';

// FlexType - Core Js

/**
 * Utility function to infer the type of a value.
 * @param {*} value The value to check.
 * @returns {string} The inferred type string.
 */
function _inferType(value) {
  const type = typeof value;

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (type === 'number' && isNaN(value)) return 'nan';
  if (type === 'object') {
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    if (value instanceof Map) return 'map';
    if (value instanceof Set) return 'set';
  }

  return type;
}

/**
 * Utility function to unwrap a FlexType instance to its raw value.
 * @param {*} value The value to unwrap.
 * @returns {*} The raw value.
 */
function _unwrap(value) {
  return value instanceof FlexType ? value.value : value;
}

/**
 * Utility function to get the name of a FlexType instance or 'literal'.
 * @param {*} value The value to check.
 * @returns {string} The name.
 */
function _getName(value) {
  return value instanceof FlexType ? value.name : 'literal';
}

class FlexType {
  /**
   * Creates an instance of FlexType.
   * @param {*} value The initial value.
   * @param {string} [name='unknown'] The name of the variable.
   * @param {object} [options={}] Configuration options.
   */
  constructor(value, name = 'unknown', options = {}) {
    // Store the initial value and options
    this._initialValue = value;
    this._name = name;
    this._options = {
      stringLock: false,
      boolLock: false,
      typeLock: false,
      ...options
    };

    // Space-for-time trade-off: Pre-calculate and store the converted value and type
    this._typeHistory = [];
    this._inferredType = _inferType(value);
    this._convertedValue = this._autoConvert(value);
    this._recordTypeChange(this._inferredType);
  }

  /**
   * Records a type change in the history.
   * @param {string} newType The new type.
   */
  _recordTypeChange(newType) {
    if (this._typeHistory[this._typeHistory.length - 1] !== newType) {
      this._typeHistory.push(newType);
    }
    this._inferredType = newType;
  }

  /**
   * Automatically converts the value based on its inferred type.
   * This is the core logic for the 'flex' behavior.
   * @param {*} value The value to convert.
   * @returns {*} The converted value.
   */
  _autoConvert(value) {
    if (this._options.typeLock) return value;

    switch (this._inferredType) {
      case 'string':
        return this._convertString(value);
      case 'boolean':
        return this._convertBoolean(value);
      default:
        return value;
    }
  }

  /**
   * Converts a string to a more specific type (boolean, number, JSON) if possible.
   * @param {string} str The string to convert.
   * @returns {*} The converted value or the original string.
   */
  _convertString(str) {
    if (this._options.stringLock) return str;

    const trimmed = str.trim();
    if (trimmed === '') return str;

    // Boolean conversion
    const lowerTrimmed = trimmed.toLowerCase();
    if (lowerTrimmed === 'true') {
      this._recordTypeChange('boolean');
      return true;
    }
    if (lowerTrimmed === 'false') {
      this._recordTypeChange('boolean');
      return false;
    }

    // Number conversion
    if (!isNaN(trimmed) && trimmed !== '') {
      const num = Number(trimmed);
      // Check for safe integer range is a good practice, but for performance,
      // we can rely on standard Number conversion unless BigInt is explicitly required.
      // For simplicity and performance, we use standard Number conversion.
      if (isFinite(num)) {
        this._recordTypeChange('number');
        return num;
      }
    }

    // JSON conversion
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const json = JSON.parse(trimmed);
        this._recordTypeChange(Array.isArray(json) ? 'array' : 'object');
        return json;
      } catch {
        // If JSON parsing fails, return the original string
        return str;
      }
    }

    return str;
  }

  /**
   * Converts a boolean to a number (0 or 1) if boolLock is active.
   * @param {boolean} bool The boolean value.
   * @returns {*} The converted value.
   */
  _convertBoolean(bool) {
    // The original logic was to convert to 1 or 0 only if boolLock is active.
    // This is a specific behavior that should be preserved.
    if (this._options.boolLock) {
      return bool ? 1 : 0;
    }
    return bool;
  }

  // --- Lock Methods (Return new FlexType instance for immutability) ---

  /**
   * Returns a new FlexType instance with string conversion locked.
   * @returns {FlexType} A new locked instance.
   */
  strLock() {
    return new FlexType(this._initialValue, this._name, {
      ...this._options,
      stringLock: true
    });
  }

  /**
   * Returns a new FlexType instance with boolean conversion locked.
   * @returns {FlexType} A new locked instance.
   */
  boolLock() {
    return new FlexType(this._initialValue, this._name, {
      ...this._options,
      boolLock: true
    });
  }

  /**
   * Returns a new FlexType instance with all type conversions locked.
   * @returns {FlexType} A new locked instance.
   */
  typeLock() {
    return new FlexType(this._initialValue, this._name, {
      ...this._options,
      typeLock: true
    });
  }

  /**
   * Returns a new FlexType instance with all locks removed.
   * @returns {FlexType} A new unlocked instance.
   */
  unlock() {
    return new FlexType(this._initialValue, this._name, {
      stringLock: false,
      boolLock: false,
      typeLock: false
    });
  }

  // --- Getters ---

  /**
   * Gets the converted value.
   * @returns {*} The converted value.
   */
  get value() { return this._convertedValue; }

  /**
   * Gets the inferred type.
   * @returns {string} The inferred type.
   */
  get type() { return this._inferredType; }

  /**
   * Gets the name of the variable.
   * @returns {string} The name.
   */
  get name() { return this._name; }

  /**
   * Gets the history of type changes.
   * @returns {string[]} The type history array.
   */
  get typeHistory() { return [...this._typeHistory]; }

  /**
   * Checks if any lock is active.
   * @returns {boolean} True if locked, false otherwise.
   */
  get isLocked() {
    return this._options.stringLock || this._options.boolLock || this._options.typeLock;
  }

  // --- Type Checkers (Simplified) ---

  isString() { return this._inferredType === 'string'; }
  isNumber() { return this._inferredType === 'number'; }
  isBoolean() { return this._inferredType === 'boolean'; }
  isArray() { return this._inferredType === 'array'; }
  isObject() { return this._inferredType === 'object'; }
  isNull() { return this._inferredType === 'null'; }
  isUndefined() { return this._inferredType === 'undefined'; }

  // --- Math Operations (Simplified and consolidated logic) ---

  /**
   * Performs a mathematical operation and returns a new FlexType instance.
   * @param {string} operator The mathematical operator ('+', '-', '*', '/').
   * @param {*} other The other operand (raw value or FlexType instance).
   * @returns {FlexType} A new FlexType instance with the result.
   */
  _mathOperation(operator, other) {
    const otherValue = _unwrap(other);

    // Check for string lock
    if (this._options.stringLock && this.isString()) {
      throw new Error(`String locked variable '${this._name}' cannot be used in mathematical operations`);
    }

    let val1 = this._convertedValue;
    // Special handling for boolLock: convert boolean to 0 or 1 for math
    if (this._options.boolLock && this.isBoolean()) {
      val1 = this.value ? 1 : 0;
    }

    let result;
    switch (operator) {
      case '+':
        result = val1 + otherValue;
        break;
      case '-':
        result = val1 - otherValue;
        break;
      case '*':
        result = val1 * otherValue;
        break;
      case '/':
        result = val1 / otherValue;
        break;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    // Preserve the original boolLock behavior of clamping the result to [0, 1]
    if (this._options.boolLock && this.isBoolean()) {
      result = Math.max(0, Math.min(1, result));
    }

    return new FlexType(result, `(${this._name} ${operator} ${_getName(other)})`);
  }

  add(other) { return this._mathOperation('+', other); }
  subtract(other) { return this._mathOperation('-', other); }
  multiply(other) { return this._mathOperation('*', other); }
  divide(other) { return this._mathOperation('/', other); }

  // --- String Operation ---

  /**
   * Shifts the character codes of the string by a given offset.
   * @param {number} offset The offset to shift by.
   * @returns {FlexType} A new FlexType instance with the shifted string.
   */
  charShift(offset) {
    if (!this.isString()) {
      throw new Error(`charShift can only be used on string types. Current type: ${this._inferredType}`);
    }

    if (this._options.stringLock) {
      throw new Error(`String locked variable '${this._name}' cannot use charShift`);
    }

    let result = '';
    for (let i = 0; i < this._convertedValue.length; i++) {
      const charCode = this._convertedValue.charCodeAt(i);
      result += String.fromCharCode(charCode + offset);
    }

    return new FlexType(result, `charShift(${this._name}, ${offset})`);
  }

  // --- Array/Object Operations (Mutators) ---

  /**
   * Gets a property from the wrapped object/array.
   * @param {string|number} property The property key or array index.
   * @returns {FlexType} A new FlexType instance wrapping the property value.
   */
  get(property) {
    if (!this.isArray() && !this.isObject()) {
      throw new Error(`get() can only be used on array or object types. Current type: ${this._inferredType}`);
    }

    const propValue = this._convertedValue[property];
    return new FlexType(propValue, `${this._name}.${property}`);
  }

  /**
   * Sets a property on the wrapped object/array.
   * @param {string|number} property The property key or array index.
   * @param {*} value The value to set (raw value or FlexType instance).
   * @returns {FlexType} The current instance (mutator).
   */
  set(property, value) {
    if (!this.isArray() && !this.isObject()) {
      throw new Error(`set() can only be used on array or object types. Current type: ${this._inferredType}`);
    }

    const newValue = _unwrap(value);
    this._convertedValue[property] = newValue;
    return this;
  }

  /**
   * Pushes items onto the wrapped array.
   * @param {...*} items Items to push (raw values or FlexType instances).
   * @returns {FlexType} The current instance (mutator).
   */
  push(...items) {
    if (!this.isArray()) {
      throw new Error(`push() can only be used on array types. Current type: ${this._inferredType}`);
    }

    const unwrappedItems = items.map(item => _unwrap(item));
    this._convertedValue.push(...unwrappedItems);
    return this;
  }

  // --- Type Conversion Methods (Return new FlexType instance) ---

  toString() {
    return new FlexType(String(this._convertedValue), `String(${this._name})`);
  }

  toNumber() {
    return new FlexType(Number(this._convertedValue), `Number(${this._name})`);
  }

  toBoolean() {
    return new FlexType(Boolean(this._convertedValue), `Boolean(${this._name})`);
  }

  // --- Debug Info ---

  /**
   * Returns a debug object with internal state.
   * @returns {object} Debug information.
   */
  debug() {
    return {
      name: this._name,
      value: this._convertedValue,
      type: this._inferredType,
      typeHistory: this._typeHistory,
      options: { ...this._options },
      isLocked: this.isLocked
    };
  }
}

// --- Export Functions ---

/**
 * Creates a new FlexType instance.
 * @param {string} name The name of the variable.
 * @param {*} value The initial value.
 * @param {object} [options={}] Configuration options.
 * @returns {FlexType} A new FlexType instance.
 */
function flex(name, value, options = {}) {
  if (typeof name !== 'string') {
    throw new Error('Variable name must be a string');
  }
  return new FlexType(value, name, options);
}

/**
 * Creates multiple FlexType instances from an object of variables.
 * @param {object} variables An object where keys are names and values are initial values.
 * @param {object} [options={}] Configuration options for all created instances.
 * @returns {object} An object containing the new FlexType instances.
 */
function declareFlex(variables, options = {}) {
  const result = {};
  for (const [name, value] of Object.entries(variables)) {
    result[name] = flex(name, value, options);
  }
  return result;
}

exports.FlexType = FlexType;
exports.declareFlex = declareFlex;
exports.flex = flex;
