import { FlexType, flex, declareFlex } from './dist/flextype.esm.js'

let passed = 0, failed = 0

function assert(ok, msg) {
  if (ok) { passed++; return }
  failed++
  console.error(`FAIL: ${msg}`)
}

function eq(a, b, msg) { assert(a === b, `${msg}: ${a} !== ${b}`) }
function neq(a, b, msg) { assert(a !== b, `${msg}: ${a} === ${b}`) }

// --- Type Inference ---
eq(flex('a', '123').type, 'number', 'string number -> number')
eq(flex('a', 'true').type, 'boolean', 'string "true" -> boolean')
eq(flex('a', 'false').type, 'boolean', 'string "false" -> boolean')
eq(flex('a', '{"x":1}').type, 'object', 'string JSON obj -> object')
eq(flex('a', '[1,2]').type, 'array', 'string JSON arr -> array')
eq(flex('a', 'hello').type, 'string', 'plain string stays string')
eq(flex('a', 42).type, 'number', 'number stays number')
eq(flex('a', true).type, 'boolean', 'boolean stays boolean')
eq(flex('a', null).type, 'null', 'null stays null')
eq(flex('a', undefined).type, 'undefined', 'undefined stays undefined')
eq(flex('a', [1,2]).type, 'array', 'array stays array')
eq(flex('a', {a:1}).type, 'object', 'object stays object')

// --- Value Conversion ---
eq(flex('a', '123').value, 123, 'string "123" -> 123')
eq(flex('a', 'true').value, true, 'string "true" -> true')
eq(flex('a', 'false').value, false, 'string "false" -> false')
eq(flex('a', '{"x":1}').value.x, 1, 'JSON object parse')
eq(flex('a', '[1,2]').value[0], 1, 'JSON array parse')
eq(flex('a', 'hello').value, 'hello', 'plain string preserved')

// --- Lock ---
eq(flex('a', '123').strLock().value, '123', 'strLock keeps string')
eq(flex('a', true).boolLock().add(0).value, 1, 'boolLock true -> 1')
eq(flex('a', false).boolLock().add(0).value, 0, 'boolLock false -> 0')
eq(flex('a', 'hello').typeLock().value, 'hello', 'typeLock preserves value')

// --- Math ---
eq(flex('a', '10').add(5).value, 15, 'add')
eq(flex('a', '10').subtract(3).value, 7, 'subtract')
eq(flex('a', '10').multiply(5).value, 50, 'multiply')
eq(flex('a', '10').divide(2).value, 5, 'divide')

// --- Bool math ---
eq(flex('a', true).boolLock().subtract(1).value, 0, 'boolLock subtract')
eq(flex('a', true).boolLock().add(0.5).value, 1, 'boolLock clamp top')

// --- Array/Object ---
eq(flex('a', [1,2,3]).get(1).value, 2, 'array get')
const arr = flex('a', [1])
arr.push(2, 3)
eq(arr.value.length, 3, 'array push')
eq(arr.value[2], 3, 'array push value')
const obj = flex('a', {x: 1})
eq(obj.get('x').value, 1, 'object get')
obj.set('y', 2)
eq(obj.value.y, 2, 'object set')

// --- Conversion methods ---
eq(flex('a', 42).toString().value, '42', 'to string')
eq(flex('a', '42').toNumber().value, 42, 'to number')
eq(flex('a', 0).toBoolean().value, false, 'to boolean false')
eq(flex('a', 1).toBoolean().value, true, 'to boolean true')

// --- declareFlex ---
const vars = declareFlex({ a: '123', b: 'true' })
eq(vars.a.value, 123, 'declareFlex number')
eq(vars.b.value, true, 'declareFlex boolean')

// --- Unwrap / FlexType in FlexType ---
const inner = flex('inner', '10')
const outer = flex('outer', inner)
eq(outer.value, 10, 'FlexType wrapping unwraps in convert')

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
