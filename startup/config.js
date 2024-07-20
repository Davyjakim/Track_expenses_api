

module.exports = function(){
    if (!process.env.TrackExpense_jwtPrivateKey) {
        throw new Error("FATAL ERROR: keyforauth is not defined.");
      }
}