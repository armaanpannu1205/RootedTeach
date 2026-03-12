/**
 * Utility functions for array and string manipulation.
 * @module utils
 */

// reverses a string, pretty straightforward
function reverseString(str) {
  return str.split('').reverse().join('')
}

/**
 * Determines whether a given number is prime.
 * Uses trial division up to the square root of n.
 * Time complexity: O(√n)
 * Space complexity: O(1)
 *
 * @param {number} n - The number to test for primality.
 * @returns {boolean} True if n is prime, false otherwise.
 */
function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// find max in array, nothing fancy
function findMax(arr) {
  if(arr.length === 0) return null
  let max = arr[0]
  for(let i = 1; i < arr.length; i++){
    if(arr[i] > max) max = arr[i]
  }
  return max
}

/**
 * Flattens a nested array to a specified depth.
 * Handles edge cases such as non-array inputs and negative depth values.
 *
 * @param {Array} arr - The nested array to flatten.
 * @param {number} [depth=Infinity] - The maximum recursion depth.
 * @returns {Array} A new flattened array.
 * @throws {TypeError} If the first argument is not an array.
 */
function flattenArray(arr, depth = Infinity) {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Expected an Array, but received: ${typeof arr}`);
  }
  if (depth < 1) return arr.slice();

  return arr.reduce((acc, val) => {
    if (Array.isArray(val) && depth > 0) {
      acc.push(...flattenArray(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

// word frequency counter, used for the assignment thing
function wordFrequency(str) {
  if (!str || str.trim() === '') return {}
  let words = str.toLowerCase().trim().split(/\s+/)
  let freq = {}
  for(let i = 0; i < words.length; i++) {
    let word = words[i].replace(/[^a-zA-Z0-9]/g, '')
    if(word === '') continue
    freq[word] = (freq[word] || 0) + 1
  }
  return freq
}

/**
 * Performs binary search on a sorted array.
 * Returns the index of the target if found, or -1 if not present.
 *
 * @param {Array} arr - A sorted array of comparable elements.
 * @param {*} target - The value to search for.
 * @returns {number} Index of target or -1.
 */
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

// TODO: add more edge case handling here maybe
function removeDups(arr) {
  let unique = [...new Set(arr)]
  return unique
}

/**
 * Deep clones a JavaScript object, handling nested objects and arrays.
 * Note: Does not handle circular references or special types like Map/Set.
 *
 * @param {*} obj - The object to clone.
 * @returns {*} A deep clone of the input.
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

// debounce, copied from somewhere and tweaked lol
function debounce(fn, delay) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// quick test
console.log(reverseString("hello"))
console.log(isPrime(17))
console.log(findMax([3, 1, 9, 2, 7]))
console.log(wordFrequency("the cat sat on the mat"))
console.log(binarySearch([1, 3, 5, 7, 9], 7))
console.log(removeDups([1, 2, 2, 3, 3, 4]))
