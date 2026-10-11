export const scheduleMeeting = () => {
    const CALENDAR_TYPE = process.env.NEXT_PUBLIC_CALENDAR_TYPE || "google"; // Default: Google

    switch (CALENDAR_TYPE) {
        case "google":
            scheduleGoogleCalendarMeeting();
            break;
        case "calendly":
            scheduleCalendlyMeeting();
            break;

        default:
            scheduleGoogleCalendarMeeting();
            break;
    }
};

// Google Calendar Logic
const scheduleGoogleCalendarMeeting = () => {
    const eventTitle = "Meeting with Kritrim Solutions";
    const eventDetails = "Let's discuss AI automation solutions.";
    const eventLocation = "Google Meet";
    const startTime = new Date().toISOString().replace(/-|:|\.\d+/g, "");
    const endTime = new Date(new Date().getTime() + 30 * 60000)
        .toISOString()
        .replace(/-|:|\.\d+/g, "");

    const guestEmails = ["vishnupritham54@gmail.com", "sayakbhattacharyyya@gmail.com"];

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        eventTitle
    )}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(
        eventLocation
    )}&dates=${startTime}/${endTime}&add=${encodeURIComponent(guestEmails.join(","))}`;

    window.open(googleCalendarUrl, "_blank");
};

// Calendly Scheduling Logic
const scheduleCalendlyMeeting = () => {
    const eventTitle = "Meeting with Kritrim Solutions";
    const eventDetails = "Let's discuss AI automation solutions.";
    const eventDuration = "30"; // Duration in minutes
    const calendlyUrl = `https://calendly.com/sayakbhattacharyyya/${eventDuration}min?text=${encodeURIComponent(
        eventTitle
    )}&details=${encodeURIComponent(eventDetails)}`;

    // Open Calendly scheduling page
    window.open(calendlyUrl, "_blank");
};
