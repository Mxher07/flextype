import { flex } from './dist/flextype.esm.js'

function bench(name, fn, iterations = 100000) {
  const start = process.hrtime.bigint()
  for (let i = 0; i < iterations; i++) fn()
  const end = process.hrtime.bigint()
  const ms = Number(end - start) / 1e6
  console.log(`${name}: ${ms.toFixed(2)}ms (${(ms / iterations * 1e3).toFixed(3)}µs/op)`)
}

console.log('--- FlexType Benchmarks ---\n')

bench('flex("123")', () => flex('x', '123').value)
bench('flex("true")', () => flex('x', 'true').value)
bench('flex("{}")', () => flex('x', '{}').value)
bench('flex(42)', () => flex('x', 42).value)
bench('flex("plain")', () => flex('x', 'plain').value)

const ft = flex('x', '100')
bench('ft.add(5)', () => ft.add(5).value)
bench('ft.subtract(3)', () => ft.subtract(3).value)

const fa = flex('x', [1,2,3])
bench('fa.get(0)', () => fa.get(0).value)

console.log('\nDone.')
