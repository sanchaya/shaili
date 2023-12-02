export const formatDate = (timestamp: string) => {
    const dateTime = new Date(timestamp);
    let formattedDate = dateTime.toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
    return formattedDate;
};
