/**
 * getGreeting utility
 * Returns a professional, time-based greeting for different user types.
 */
export const getGreetingData = (name, loginCount = 0) => {
    const hour = new Date().getHours();
    let timeGreeting = "Hello";
    let emoji = "👋";

    if (hour >= 5 && hour < 12) {
        timeGreeting = "Good Morning";
        emoji = "☀️";
    } else if (hour >= 12 && hour < 18) {
        timeGreeting = "Good Afternoon";
        emoji = "🌤️";
    } else {
        timeGreeting = "Good Evening";
        emoji = "🌙";
    }

    const userName = name ? name.split(' ')[0] : "Professional";
    const isNewUser = loginCount <= 1;

    let subMsg = "";

    if (isNewUser) {
        subMsg = `Welcome aboard 👋, let’s build your career journey 🚀`;
    } else {
        subMsg = `Welcome back, ready for your next move?`;
    }

    return {
        main: `${timeGreeting}, ${userName} ${emoji}`,
        sub: subMsg
    };
};
