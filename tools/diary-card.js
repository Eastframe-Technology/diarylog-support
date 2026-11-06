// Day order for the printable diary card. Uses the same week rule as
// DiaryLog's lib/logic/dates.dart: firstWeekday is 1 (Monday) to 7 (Sunday).
// Runs in the browser (window.DiaryCard) and under node (require).
// Tests: node tools/diary-card.test.js
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DiaryCard = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // How many days after the week's first day a weekday falls. In the app this
  // is the offset inside weekStart: (day.weekday - firstWeekday + 7) % 7.
  function offset(weekday, firstWeekday) {
    return (weekday - firstWeekday + 7) % 7;
  }

  function dayOrder(firstWeekday) {
    var first = Number(firstWeekday);
    if (!(first >= 1 && first <= 7) || Math.floor(first) !== first) first = 1;
    var order = [];
    for (var i = 0; i < 7; i++) order.push(DAYS[(first - 1 + i) % 7]);
    return order;
  }

  return { DAYS: DAYS, offset: offset, dayOrder: dayOrder };
});
