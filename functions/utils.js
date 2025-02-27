// functions/utils.js
function isEmailValid(email) {
    // Very naive check (not production-ready!)
    return /\S+@\S+\.\S+/.test(email);
}

module.exports = { isEmailValid };
