import { flex } from './dist/flextype.esm.js';

// --- Baseline Function (No FlexType overhead) ---
function baselineTest(value) {
    // Simulate the work that FlexType does: type inference and conversion
    const type = typeof value;
    let convertedValue = value;

    if (type === 'string') {
        const trimmed = value.trim();
        if (trimmed === 'true') {
            convertedValue = true;
        } else if (trimmed === 'false') {
            convertedValue = false;
        } else if (!isNaN(trimmed) && trimmed !== '') {
            convertedValue = Number(trimmed);
        } else if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
                   (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                convertedValue = JSON.parse(trimmed);
            } catch (e) {
                // Keep original string on failure
            }
        }
    }
    
    // Simulate a subsequent operation (e.g., getting the value)
    return convertedValue;
}

// --- Performance Test Utility ---
function runTest(name, func, iterations, ...args) {
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        func(...args);
    }
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert nanoseconds to milliseconds
    console.log(`Test: ${name}`);
    console.log(`Iterations: ${iterations.toLocaleString()}`);
    console.log(`Total Time: ${duration.toFixed(3)} ms`);
    console.log(`Time per operation: ${(duration * 1000 / iterations).toFixed(5)} µs`);
    return duration;
}

// --- Test Cases ---
const ITERATIONS = 100000;

const testValues = [
    { name: 'String to Number', value: '12345', expectedType: 'number' },
    { name: 'String to Boolean (true)', value: 'true', expectedType: 'boolean' },
    { name: 'String to JSON Object', value: '{"key": "value"}', expectedType: 'object' },
    { name: 'Plain String', value: 'hello world', expectedType: 'string' },
    { name: 'Plain Number', value: 42, expectedType: 'number' },
];

console.log('--- FlexType Performance Test (Space-for-Time Optimization) ---');
console.log(`Running ${ITERATIONS.toLocaleString()} iterations for each test case.\n`);

// 1. Test Initialization (The part that benefits from the optimization)
console.log('--- 1. Initialization Test (Constructor Overhead) ---');

function flexInit(value) {
    return flex('test', value);
}

function baselineInit(value) {
    return baselineTest(value);
}

for (const { name, value } of testValues) {
    console.log(`\nCase: ${name}`);
    
    // FlexType Initialization
    const flexDuration = runTest(`FlexType Init: ${name}`, flexInit, ITERATIONS, value);
    
    // Baseline Initialization
    const baselineDuration = runTest(`Baseline Init: ${name}`, baselineInit, ITERATIONS, value);
    
    const overhead = flexDuration - baselineDuration;
    console.log(`Overhead (FlexType - Baseline): ${overhead.toFixed(3)} ms`);
    console.log(`Overhead Percentage: ${(overhead / baselineDuration * 100).toFixed(2)}%`);
}

// 2. Test Value Access (The part that should be faster due to optimization)
console.log('\n--- 2. Value Access Test (Post-Initialization) ---');

// Pre-initialize FlexType instances
const flexInstances = testValues.map(item => flex('test', item.value));

function flexAccess(instance) {
    return instance.value;
}

function baselineAccess(value) {
    // In a real scenario, the baseline would just access the pre-converted value.
    // Since the baselineInit already did the conversion, we just access it here.
    return value;
}

for (let i = 0; i < testValues.length; i++) {
    const { name, value } = testValues[i];
    const flexInstance = flexInstances[i];
    
    // Get the pre-converted baseline value
    const baselineValue = baselineInit(value);

    console.log(`\nCase: ${name}`);
    
    // FlexType Access
    const flexDuration = runTest(`FlexType Access: ${name}`, flexAccess, ITERATIONS * 10, flexInstance);
    
    // Baseline Access (Accessing a simple variable)
    const baselineDuration = runTest(`Baseline Access: ${name}`, baselineAccess, ITERATIONS * 10, baselineValue);
    
    const difference = baselineDuration - flexDuration;
    console.log(`Difference (Baseline - FlexType): ${difference.toFixed(3)} ms`);
    console.log(`Performance Change: ${(difference > 0 ? 'FlexType is faster' : 'FlexType is slower')}`);
    console.log(`Speedup/Slowdown Percentage: ${Math.abs(difference / baselineDuration * 100).toFixed(2)}%`);
}

// 3. Test Math Operation (Should be fast due to pre-conversion)
console.log('\n--- 3. Math Operation Test ---');

const mathInstance = flex('math_val', '100'); // Converted to number 100
const mathOperand = 5;

function flexMath(instance, operand) {
    return instance.add(operand).value;
}

function baselineMath(value, operand) {
    return value + operand;
}

// FlexType Math
const flexMathDuration = runTest('FlexType Math (add)', flexMath, ITERATIONS * 10, mathInstance, mathOperand);

// Baseline Math
const baselineMathDuration = runTest('Baseline Math (add)', baselineMath, ITERATIONS * 10, mathInstance.value, mathOperand);

const mathDifference = baselineMathDuration - flexMathDuration;
console.log(`Difference (Baseline - FlexType): ${mathDifference.toFixed(3)} ms`);
console.log(`Performance Change: ${(mathDifference > 0 ? 'FlexType is faster' : 'FlexType is slower')}`);
console.log(`Speedup/Slowdown Percentage: ${Math.abs(mathDifference / baselineMathDuration * 100).toFixed(2)}%`);
