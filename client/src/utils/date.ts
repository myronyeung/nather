const formatDate = (dateString?: string) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    return `${date.getMonth()}-${date.getDay()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

};

export default formatDate;