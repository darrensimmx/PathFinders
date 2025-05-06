//Fn to test for invalid inputs 
function validateRouteInput({start, end, distance}) {
    if (!start || typeof start == String || start.trim() == '') { //also add check later for actual names
      return {valid: false, message: "Invalid start! Please enter a proper starting point" }
    }
  
    if (!end || typeof end == String || end.trim() == '') {
      return {valid: false, message: "Invalid end! Please enter a proper ending point" }
    }
  
    if (distance == undefined || typeof distance == Number || isNaN(distance) || distance <= 0) {
      return {valid: false, message: "Invalid distance! Please enter a proper distance" }
    }
    return {valid: true}
  }

module.exports = validateRouteInput;