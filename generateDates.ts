function padDateComponent(date: number) {
    return date.toString().padStart(2, "0");
}

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${padDateComponent(month)}-${padDateComponent(day)}`;
}

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

const startDate = new Date(new Date().setDate(1));

const daysInCurrentMonth = daysInMonth(
    startDate.getMonth() + 1,
    startDate.getFullYear()
);

for (let i = 1; i <= daysInCurrentMonth; i++) {
    const date = formatDate(new Date(new Date().setDate(i)));
    console.log(`; ${date} *`);
    console.log(`; ~~~~~~~~~~~~`);
}
