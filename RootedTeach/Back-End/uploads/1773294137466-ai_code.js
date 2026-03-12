/**
 * Finds the maximum value in an array of numbers.
 * @param {number[]} arr - The input array of numbers.
 * @returns {number|null} The maximum value, or null if the array is empty.
 */
function findMaxValue(arr) {
  if (!arr || arr.length === 0) {
    return null;
  }

  return arr.reduce((maxValue, currentValue) => {
    return currentValue > maxValue ? currentValue : maxValue;
  }, arr[0]);
}

// Example usage
const numbers = [3, 7, 1, 9, 4];
const maximum = findMaxValue(numbers);
console.log(`The maximum value is: ${maximum}`); // The maximum value is: 9
