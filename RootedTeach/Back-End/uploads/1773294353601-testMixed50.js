// array and string utilities
// wrote most of this for the assignment, cleaned up a few parts

function reverseString(str) {
  return str.split('').reverse().join('')
}

// checks if prime, handles edge cases
function isPrime(n) {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

/**
 * Finds the maximum value in an array.
 * @param {number[]} arr
 * @returns {number}
 */
function findMax(arr) {
  if (!arr || arr.length === 0) return null
  let max = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

// flatten nested arrays recursively
function flatten(arr, depth = Infinity) {
  let result = []
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result = result.concat(flatten(item, depth - 1))
    } else {
      result.push(item)
    }
  }
  return result
}

/**
 * Counts word frequency in a string.
 * Case-insensitive, ignores punctuation.
 * @param {string} text
 * @returns {Object}
 */
function wordFrequency(text) {
  if (!text || !text.trim()) return {}
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/)
  const freq = {}
  for (const word of words) {
    if (word) freq[word] = (freq[word] || 0) + 1
  }
  return freq
}

function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    else if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}

// remove dups using set
function removeDuplicates(arr) {
  return [...new Set(arr)]
}

/**
 * Deep clones an object. Handles nested objects and arrays.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (Array.isArray(obj)) return obj.map(deepClone)
  const clone = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) clone[key] = deepClone(obj[key])
  }
  return clone
}

function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// quick tests
console.log(reverseString('hello'))
console.log(isPrime(13))
console.log(findMax([3, 7, 1, 9, 4]))
console.log(flatten([1, [2, [3, [4]]]]))
console.log(binarySearch([1, 3, 5, 7, 9, 11], 7))
console.log(removeDuplicates([1, 2, 2, 3, 3, 3, 4]))
