// helper functions for the project
// mostly wrote this myself, looked up the binary search part

function reverseString(str) {
  return str.split('').reverse().join('')
}

function isPrime(n) {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 == 0) return false

  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

// find the max, pretty simple
function findMax(arr) {
  if (!arr || arr.length == 0) return null
  var max = arr[0]
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i]
  }
  return max
}

function flatten(arr) {
  let result = []
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result = result.concat(flatten(arr[i]))
    } else {
      result.push(arr[i])
    }
  }
  return result
}

// word count thing
function wordFreq(str) {
  if (!str) return {}
  let words = str.toLowerCase().split(/\s+/)
  let freq = {}
  for (let i = 0; i < words.length; i++) {
    let w = words[i].replace(/[^a-z0-9]/g, '')
    if (!w) continue
    if (freq[w]) {
      freq[w]++
    } else {
      freq[w] = 1
    }
  }
  return freq
}

/**
 * Performs binary search on a sorted array.
 * Returns index of target or -1 if not found.
 * Time complexity: O(log n)
 *
 * @param {Array} arr - sorted array
 * @param {*} target - value to find
 * @returns {number}
 */
function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1
  while (left <= right) {
    let mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    else if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}

// just uses a set lol
function removeDups(arr) {
  return [...new Set(arr)]
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof Array) {
    let arr = []
    for (let i = 0; i < obj.length; i++) {
      arr.push(deepClone(obj[i]))
    }
    return arr
  }
  let cloned = {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

function debounce(fn, delay) {
  let timer
  return function() {
    clearTimeout(timer)
    // TODO: maybe pass args through properly later
    timer = setTimeout(fn, delay)
  }
}

// testing stuff
console.log(reverseString('hello world'))
console.log(isPrime(7))
console.log(isPrime(10))
console.log(findMax([4, 2, 9, 1, 7]))
console.log(flatten([1, [2, [3]]]))
console.log(binarySearch([1, 3, 5, 7, 9], 5))
console.log(removeDups([1, 1, 2, 3, 3]))
