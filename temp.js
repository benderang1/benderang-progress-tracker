const result =
    await calendar.calendarList.list();

console.log(
    result.data.items
);