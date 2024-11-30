import axios from "axios";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function sendSlackMessage(payload: string) {
    // Create the payload object
    const data = {
        channel: "#afsar-personal", // Channel or user to send the message
        username: "Afsar Bot",      // Bot username
        text: payload,              // Message text
        icon_emoji: ":birthday:"    // Optional emoji for the bot
    };

    // Axios request configuration
    const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: SLACK_WEBHOOK_URL, // Replace with your webhook URL
        headers: {
            'Content-Type': 'application/json' // Ensure proper content type
        },
        data: JSON.stringify(data) // Send the data as JSON
    };

    try {
        // Make the Axios request
        const response = await axios.request(config);
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}
