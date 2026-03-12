// finds the biggest number in a list
function findMax(arr) {
    if(arr.length == 0) return null
    var max = arr[0]
    for(var i = 1; i < arr.length; i++){
        if(arr[i] > max){
            max = arr[i]
        }
    }
    return max
}

// test it
var nums = [3, 7, 1, 9, 4]
console.log(findMax(nums)) // 9
