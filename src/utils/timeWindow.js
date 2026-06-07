function getWindowStart(windowSeconds) {
  return Date.now() - (windowSeconds * 1000);
}

function getResetTime(windowSeconds) {
  return Date.now() + (windowSeconds * 1000);
}

module.exports = {
  getWindowStart,
  getResetTime
};
