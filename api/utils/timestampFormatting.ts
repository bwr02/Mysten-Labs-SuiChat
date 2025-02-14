export function formatTimestamp(timestamp: string): string {
    let timeString = "";
        if(timestamp) {
            const numericTimestamp = parseInt(timestamp, 10);
            if (!isNaN(numericTimestamp)) {
                const messageDate = new Date(numericTimestamp);
                const currentDate = new Date();

                // Calculate the difference in milliseconds
                const msDifference = currentDate.getTime() - messageDate.getTime();
                const hoursDifference = msDifference / (1000 * 60 * 60);
                const daysDifference = msDifference / (1000 * 60 * 60 * 24);

                if (messageDate.toDateString() === currentDate.toDateString()) {
                    // Same day, show time
                    timeString = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                } else if (daysDifference < 2 && messageDate.getDate() === currentDate.getDate() - 1) {
                    // Yesterday, show "Yesterday"
                    timeString = "Yesterday";
                } else if (daysDifference < 7) {
                    // Within a week, show day of the week (e.g., "Mon")
                    timeString = messageDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                    });
                } else {
                    // More than a week ago, show date (e.g., "Feb 10")
                    timeString = messageDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    });
                }
            }
        }
    return timeString;
}