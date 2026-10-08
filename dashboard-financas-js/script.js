const STORAGE_KEY = "portfolio-financas-transacoes";

const form = document.querySelector("#transactionForm");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");
const categoryInput = document.querySelector("#category");
const filterInput = document.querySelector("#filter");
const list = document.querySelector("#transactionList");

const balanceElement = document.querySelector("#balance");
const incomeElement = document.querySelector("#income");
const expenseElement = document.querySelector("#expense");
const clearAllButton = document.querySelector("#clearAll");

let transactions = loadTransactions();

function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function updateSummary() {
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  balanceElement.textContent = formatCurrency(income - expense);
  incomeElement.textContent = formatCurrency(income);
  expenseElement.textContent = formatCurrency(expense);
}

function renderTransactions() {
  const filter = filterInput.value;
  const filtered = transactions.filter(
    (transaction) => filter === "all" || transaction.type === filter
  );

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">Nenhuma transação encontrada.</div>';
    return;
  }

  list.innerHTML = filtered
    .map((transaction) => {
      const sign = transaction.type === "income" ? "+" : "-";
      return `
        <div class="transaction">
          <div class="transaction-info">
            <strong>${escapeHtml(transaction.description)}</strong>
            <small>${escapeHtml(transaction.category)}</small>
          </div>
          <span class="transaction-value ${transaction.type}">
            ${sign} ${formatCurrency(transaction.amount)}
          </span>
          <button class="delete-btn" title="Excluir" data-id="${transaction.id}">✕</button>
        </div>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    return;
  }

  transactions.unshift({
    id: crypto.randomUUID(),
    description,
    amount,
    type: typeInput.value,
    category: categoryInput.value
  });

  saveTransactions();
  updateSummary();
  renderTransactions();
  form.reset();
  descriptionInput.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;

  transactions = transactions.filter(
    (transaction) => transaction.id !== button.dataset.id
  );

  saveTransactions();
  updateSummary();
  renderTransactions();
});

filterInput.addEventListener("change", renderTransactions);

clearAllButton.addEventListener("click", () => {
  if (transactions.length === 0) return;

  const confirmed = confirm("Tem certeza que deseja apagar todas as transações?");
  if (!confirmed) return;

  transactions = [];
  saveTransactions();
  updateSummary();
  renderTransactions();
});

updateSummary();
renderTransactions();
