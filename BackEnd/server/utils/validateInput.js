//Fn to test for invalid inputs 
function validateRouteInput({start, end, distance}) {
    const isOnlyDigits = str => /^\d+$/.test(str);

    //reason we don't compare to String and Number directly is because these are functions, so it will always return false
    if (!start || typeof start != 'string' || isOnlyDigits(start.trim())) { //also add check later for actual names
      return {valid: false, message: "Invalid start! Please enter a proper starting point" }
    }
  
    if (!end || typeof end != 'string' || isOnlyDigits(end.trim())) {
      return {valid: false, message: "Invalid end! Please enter a proper ending point" }
    }
  
    if (distance == undefined || typeof distance != 'number' || isNaN(distance) || distance <= 0) {
      return {valid: false, message: "Invalid distance! Please enter a proper distance" }
    }
    return {valid: true}
  }

module.exports = validateRouteInput;