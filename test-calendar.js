const calendar = require("./calendar");

async function main() {

    await calendar.events.insert({

    calendarId: "primary",

    requestBody: {

        summary:
            "Test Event",

        start: {
            date:
                "2026-06-20"
        },

        end: {
            date:
                "2026-06-20"
        }

    }

});

}

main();