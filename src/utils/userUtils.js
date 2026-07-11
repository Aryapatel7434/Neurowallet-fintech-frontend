export const getInitials = (name = "") =>

    name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();