import dayjs from "dayjs";
import networthTemplate from "./chartDataTemplateNetworth.json";
import expensesTemplate from "./chartDataTemplateExpenses.json";

const BEGIN_DATE = "2023-05-11";

/** NETWORTH */
async function networth() {
  let beginDate = dayjs(BEGIN_DATE);
  const endDate = dayjs();

  const labels = [];
  const amounts = [];

  const exactAmountRegex = /(\d+\.\d+)/;

  do {
    const dateString = beginDate.format("YYYY-MM-DD");
    labels.push(dateString);

    const command = `hledger -e ${dateString} bal -X USD Assets not:Reimbursements -O csv`;
    const proc = Bun.spawn(command.split(" "));

    const hledgerCSVResult = await new Response(proc.stdout).text();

    const balancesForSingleDay = hledgerCSVResult.split("\n").filter(Boolean);
    const totalAmountString = balancesForSingleDay.at(-1);

    const amount = exactAmountRegex.exec(totalAmountString as string)![0];

    amounts.push(amount);

    beginDate = beginDate.add(1, "day");
  } while (beginDate.isBefore(endDate));

  // @ts-ignore
  networthTemplate.data.labels = labels;
  // @ts-ignore
  networthTemplate.data.datasets[0].data = amounts;

  return JSON.stringify(networthTemplate, null, "  ");
}

/** EXPENSES */
async function expenses() {
  const command = "hledger -p lastmonth --depth 2 bal -X USD Expenses -O csv";
  const expesnses = Bun.spawn(command.split(" "));

  const text = await new Response(expesnses.stdout).text();

  const data = text.split("\n").filter(Boolean);

  data.shift(); // remove csv header
  data.pop(); // remove "total"

  let all: { label: string; amount: number }[] = [];

  data.forEach((elem) => {
    const [label, amountString] = elem.split('","');

    const amount = parseFloat(amountString.split(" ")[0]);

    all.push({ label: label.split(":")[1], amount });
  });

  all = all.sort((a, b) => b.amount - a.amount);

  const categories = all.map((o) => o.label);
  const expenses = all.map((o) => o.amount);

  // @ts-ignore
  expensesTemplate.data.datasets[0].data = expenses;
  // @ts-ignore
  expensesTemplate.data.labels = categories;

  return JSON.stringify(expensesTemplate, null, "  ");
}

const networthData = await networth();
const expensesData = await expenses();

console.log(networthData);

let html = await Bun.file("index.template.html").text();

html = html.replace(/{{NETWORTH}}/, networthData);
html = html.replace(/{{EXPENSES}}/, expensesData);

Bun.write("./index.html", html);
