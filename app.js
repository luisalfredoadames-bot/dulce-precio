// Agrega aquí nuevas monedas con su código, símbolo y valores de muestra.
const CURRENCIES = {
  DOP: {
    code: "DOP",
    symbol: "RD$",
    sampleCost: 850,
    samplePrice: 1600,
  },
  USD: {
    code: "USD",
    symbol: "US$",
    sampleCost: 14,
    samplePrice: 27,
  },
};

const CURRENCY_STORAGE_KEY = "dulceprecio-currency";
const RATE_STORAGE_KEY = "dulceprecio-usd-to-dop-rate";
const DRAFT_STORAGE_KEY = "dulceprecio-current-calculation";
const currencyButtons = document.querySelectorAll("[data-currency]");
const sampleCost = document.querySelector("#sample-cost");
const samplePrice = document.querySelector("#sample-price");
const rateForm = document.querySelector("#rate-form");
const rateInput = document.querySelector("#exchange-rate");
const rateMessage = document.querySelector("#rate-message");
const featureDialog = document.querySelector("#feature-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const homeSections = document.querySelectorAll(".home-section");
const calculatorView = document.querySelector("#calculator-view");
const backHomeButton = document.querySelector("#back-home");
const cakeNameInput = document.querySelector("#cake-name");
const cakeNameDisplay = document.querySelector("#cake-name-display");
const calculatorCurrencyButtons = document.querySelectorAll("[data-calculator-currency]");
const calculatorCurrencyLabel = document.querySelector("#calculator-currency-label");
const currencyLockNote = document.querySelector("#currency-lock-note");
const packagePriceSymbol = document.querySelector("#package-price-symbol");
const ingredientForm = document.querySelector("#ingredient-form");
const ingredientNameInput = document.querySelector("#ingredient-name");
const ingredientCostModeInput = document.querySelector("#ingredient-cost-mode");
const ingredientDirectCostInput = document.querySelector("#ingredient-direct-cost");
const ingredientDirectCostField = document.querySelector("#ingredient-direct-cost-field");
const quantityBasedFields = document.querySelector("#quantity-based-fields");
const packagePriceInput = document.querySelector("#package-price");
const packageQuantityInput = document.querySelector("#package-quantity");
const packageUnitInput = document.querySelector("#package-unit");
const usedQuantityInput = document.querySelector("#used-quantity");
const usedUnitInput = document.querySelector("#used-unit");
const ingredientError = document.querySelector("#ingredient-error");
const ingredientList = document.querySelector("#ingredient-list");
const emptyIngredients = document.querySelector("#empty-ingredients");
const ingredientCount = document.querySelector("#ingredient-count");
const ingredientTotal = document.querySelector("#ingredient-total");
const totalCurrencyCode = document.querySelector("#total-currency-code");
const laborHoursInput = document.querySelector("#labor-hours");
const laborHourlyRateInput = document.querySelector("#labor-hourly-rate");
const laborPercentageInput = document.querySelector("#labor-percentage");
const laborModeInputs = document.querySelectorAll("[name='labor-mode']");
const laborHoursFields = document.querySelector("#labor-hours-fields");
const laborPercentageFields = document.querySelector("#labor-percentage-fields");
const laborError = document.querySelector("#labor-error");
const laborTotal = document.querySelector("#labor-total");
const laborHourlyCost = document.querySelector("#labor-hourly-cost");
const laborPercentageCost = document.querySelector("#labor-percentage-cost");
const laborPercentageLabel = document.querySelector("#labor-percentage-label");
const laborPercentageBase = document.querySelector("#labor-percentage-base");
const productionTotal = document.querySelector("#production-total");
const productionSummaryDetail = document.querySelector("#production-summary-detail");
const profitPercentageInput = document.querySelector("#profit-percentage");
const profitQuickButtons = document.querySelectorAll("[data-profit-percentage]");
const profitError = document.querySelector("#profit-error");
const salesProductionCost = document.querySelector("#sales-production-cost");
const appliedProfitPercentage = document.querySelector("#applied-profit-percentage");
const suggestedProfit = document.querySelector("#suggested-profit");
const suggestedSalePrice = document.querySelector("#suggested-sale-price");
const realProfitMargin = document.querySelector("#real-profit-margin");
const COST_CATEGORY_KEYS = ["fillings", "toppings", "decoration", "packaging", "additional"];
const COST_CATEGORY_LABELS = {
  fillings: "rellenos",
  toppings: "coberturas y cremas",
  decoration: "decoración",
  packaging: "empaque",
  additional: "gastos adicionales",
};
let selectedCurrency = "DOP";
let calculationCurrency = null;
let ingredients = [];
let nextIngredientId = 1;
let nextCostLineId = 1;
let costLines = Object.fromEntries(COST_CATEGORY_KEYS.map((category) => [category, []]));

const UNITS = {
  g: { family: "weight", factor: 1, base: "g" },
  kg: { family: "weight", factor: 1000, base: "g" },
  lb: { family: "weight", factor: 453.59237, base: "g" },
  oz: { family: "weight", factor: 28.349523125, base: "g" },
  ml: { family: "volume", factor: 1, base: "ml" },
  l: { family: "volume", factor: 1000, base: "ml" },
  unidad: { family: "count", factor: 1, base: "unidad" },
};

// Se muestran cifras de ejemplo propias de cada moneda, nunca se convierten.
function formatExample(amount, currency) {
  const fractionDigits = currency.code === "USD" ? 2 : 0;
  const formattedAmount = new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);

  return `${currency.symbol}${formattedAmount}`;
}

function formatMoney(amount, currency) {
  const formattedAmount = new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency.symbol}${formattedAmount}`;
}

function roundMoney(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function renderSalesPrice(productionCost, currency) {
  salesProductionCost.textContent = formatMoney(productionCost, currency);
  const rawPercentage = profitPercentageInput.value;
  const percentage = Number(rawPercentage);

  profitQuickButtons.forEach((button) => {
    const isSelected = rawPercentage !== "" && Number(button.dataset.profitPercentage) === percentage;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (!rawPercentage || !Number.isFinite(percentage) || percentage < 0) {
    profitError.textContent = "Ingresa un porcentaje igual o mayor que cero.";
    appliedProfitPercentage.textContent = "—";
    suggestedProfit.textContent = "—";
    suggestedSalePrice.textContent = "—";
    realProfitMargin.textContent = "—";
    return;
  }

  const profit = roundMoney((productionCost * percentage) / 100);
  const salePrice = roundMoney(productionCost + profit);
  if (!Number.isFinite(profit) || !Number.isFinite(salePrice)) {
    profitError.textContent = "Ese porcentaje es demasiado alto para calcularlo.";
    appliedProfitPercentage.textContent = "—";
    suggestedProfit.textContent = "—";
    suggestedSalePrice.textContent = "—";
    realProfitMargin.textContent = "—";
    return;
  }

  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  profitError.textContent = "";
  appliedProfitPercentage.textContent = `${percentage}%`;
  suggestedProfit.textContent = formatMoney(profit, currency);
  suggestedSalePrice.textContent = formatMoney(salePrice, currency);
  realProfitMargin.textContent = `${new Intl.NumberFormat("es-DO", {
    maximumFractionDigits: 2,
  }).format(margin)}%`;
}

function getLaborCost(preLaborSubtotal) {
  const mode = document.querySelector("[name='labor-mode']:checked").value;
  const hoursValue = laborHoursInput.value;
  const rateValue = laborHourlyRateInput.value;
  const percentageValue = laborPercentageInput.value;
  let hourlyCost = 0;
  let percentageCost = 0;

  if (mode === "hours" || mode === "combined") {
    if (Boolean(hoursValue) !== Boolean(rateValue)) {
      laborError.textContent = "Completa las horas y el costo por hora para calcular esa parte.";
      return { hourly: 0, percentage: 0, total: 0 };
    }

    if (hoursValue && rateValue) {
      const hours = Number(hoursValue);
      const hourlyRate = Number(rateValue);
      if (!Number.isFinite(hours) || !Number.isFinite(hourlyRate) || hours < 0 || hourlyRate < 0) {
        laborError.textContent = "Las horas y el costo por hora no pueden ser negativos.";
        return { hourly: 0, percentage: 0, total: 0 };
      }
      hourlyCost = roundMoney(hours * hourlyRate);
    }
  }

  if (mode === "percentage" || mode === "combined") {
    if (percentageValue) {
      const percentage = Number(percentageValue);
      if (!Number.isFinite(percentage) || percentage < 0) {
        laborError.textContent = "El porcentaje no puede ser negativo.";
        return { hourly: 0, percentage: 0, total: 0 };
      }
      percentageCost = roundMoney((preLaborSubtotal * percentage) / 100);
    }
  }

  laborError.textContent = "";
  return {
    hourly: hourlyCost,
    percentage: percentageCost,
    total: roundMoney(hourlyCost + percentageCost),
  };
}

function getCategoryTotals() {
  const totals = {
    ingredients: roundMoney(ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0)),
  };

  COST_CATEGORY_KEYS.forEach((category) => {
    totals[category] = roundMoney(costLines[category].reduce((sum, line) => sum + line.cost, 0));
  });

  const preLaborSubtotal = roundMoney(Object.values(totals).reduce((sum, subtotal) => sum + subtotal, 0));
  const labor = getLaborCost(preLaborSubtotal);
  totals.labor = labor.total;
  totals.laborHourly = labor.hourly;
  totals.laborPercentage = labor.percentage;
  totals.preLaborSubtotal = preLaborSubtotal;
  return totals;
}

function hasCalculationEntries() {
  const savedLinesExist = ingredients.length > 0
    || COST_CATEGORY_KEYS.some((category) => costLines[category].length > 0);
  const laborHasValues = Boolean(laborHoursInput.value || laborHourlyRateInput.value || laborPercentageInput.value);
  const unsavedCostsExist = [...document.querySelectorAll(
    "#package-price, #package-quantity, #ingredient-direct-cost, #used-quantity, .line-cost-input",
  )].some((input) => input.value !== "");

  return savedLinesExist || laborHasValues || unsavedCostsExist;
}

function saveDraft() {
  const ingredientFormValues = Object.fromEntries(new FormData(ingredientForm).entries());
  const categoryFormValues = Object.fromEntries(COST_CATEGORY_KEYS.map((category) => {
    const form = document.querySelector(`[data-cost-form="${category}"]`);
    return [category, Object.fromEntries(new FormData(form).entries())];
  }));

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      cakeName: cakeNameInput.value,
      selectedCurrency,
      calculationCurrency,
      ingredients,
      costLines,
      laborHours: laborHoursInput.value,
      laborHourlyRate: laborHourlyRateInput.value,
      laborPercentage: laborPercentageInput.value,
      laborMode: document.querySelector("[name='labor-mode']:checked").value,
      profitPercentage: profitPercentageInput.value,
      ingredientFormValues,
      categoryFormValues,
    }));
  } catch {
    // El cálculo sigue activo aunque el navegador no permita guardar el borrador.
  }
}

function restoreDraft() {
  const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!savedDraft) {
    return;
  }

  const draft = JSON.parse(savedDraft);
  if (!draft || typeof draft !== "object") {
    return;
  }

  if (CURRENCIES[draft.selectedCurrency]) {
    selectedCurrency = draft.selectedCurrency;
  }
  if (CURRENCIES[draft.calculationCurrency]) {
    calculationCurrency = draft.calculationCurrency;
  }

  cakeNameInput.value = typeof draft.cakeName === "string" ? draft.cakeName : "";
  ingredients = Array.isArray(draft.ingredients)
    ? draft.ingredients.filter((item) => item && typeof item.name === "string"
      && Number.isFinite(item.cost) && item.cost >= 0 && CURRENCIES[item.currency]
      && (item.mode === "direct" || (UNITS[item.packageUnit] && UNITS[item.usedUnit]
        && UNITS[item.packageUnit].family === UNITS[item.usedUnit].family)))
    : [];

  if (draft.costLines && typeof draft.costLines === "object") {
    COST_CATEGORY_KEYS.forEach((category) => {
      const lines = draft.costLines[category];
      costLines[category] = Array.isArray(lines)
        ? lines.filter((line) => line && typeof line.name === "string"
          && Number.isFinite(line.cost) && line.cost >= 0)
        : [];
    });
  }

  const ingredientValues = draft.ingredientFormValues || {};
  Object.entries(ingredientValues).forEach(([name, value]) => {
    const field = ingredientForm.elements.namedItem(name);
    if (field && typeof value === "string") {
      field.value = value;
    }
  });

  Object.entries(draft.categoryFormValues || {}).forEach(([category, values]) => {
    const form = document.querySelector(`[data-cost-form="${category}"]`);
    if (!form || !values || typeof values !== "object") {
      return;
    }
    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field && typeof value === "string") {
        field.value = value;
      }
    });
  });

  laborHoursInput.value = typeof draft.laborHours === "string" ? draft.laborHours : "";
  laborHourlyRateInput.value = typeof draft.laborHourlyRate === "string" ? draft.laborHourlyRate : "";
  laborPercentageInput.value = typeof draft.laborPercentage === "string" ? draft.laborPercentage : "";
  profitPercentageInput.value = typeof draft.profitPercentage === "string" ? draft.profitPercentage : "30";
  const savedLaborMode = ["hours", "percentage", "combined"].includes(draft.laborMode) ? draft.laborMode : "hours";
  document.querySelector(`[name='labor-mode'][value='${savedLaborMode}']`).checked = true;
  nextIngredientId = Math.max(0, ...ingredients.map((item) => Number(item.id) || 0)) + 1;
  nextCostLineId = Math.max(0, ...COST_CATEGORY_KEYS.flatMap((category) => costLines[category])
    .map((item) => Number(item.id) || 0)) + 1;
}

function renderCurrency() {
  const currency = CURRENCIES[selectedCurrency];

  currencyButtons.forEach((button) => {
    const isSelected = button.dataset.currency === selectedCurrency;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  sampleCost.textContent = formatExample(currency.sampleCost, currency);
  samplePrice.textContent = formatExample(currency.samplePrice, currency);
  renderCalculator();
}

function renderCalculator() {
  if (!calculationCurrency) {
    calculationCurrency = selectedCurrency;
  }

  const currency = CURRENCIES[calculationCurrency];
  calculatorCurrencyLabel.textContent = `${currency.symbol} · ${currency.code}`;
  packagePriceSymbol.textContent = currency.symbol;
  totalCurrencyCode.textContent = currency.code;
  document.querySelectorAll("[data-currency-symbol], .direct-cost-symbol").forEach((element) => {
    element.textContent = currency.symbol;
  });
  ingredientDirectCostField.hidden = ingredientCostModeInput.value !== "direct";
  quantityBasedFields.hidden = ingredientCostModeInput.value === "direct";

  const hasEntries = hasCalculationEntries();
  calculatorCurrencyButtons.forEach((button) => {
    const isSelected = button.dataset.calculatorCurrency === currency.code;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    button.disabled = hasEntries && !isSelected;
  });

  currencyLockNote.textContent = hasEntries
    ? "Elimina las partidas y borra los importes ingresados para cambiar la moneda."
    : "Todos los costos de este cálculo usarán la misma moneda.";
  cakeNameDisplay.textContent = cakeNameInput.value.trim() || "Tu pastel";
  ingredientCount.textContent = ingredients.length === 1
    ? "1 ingrediente"
    : `${ingredients.length} ingredientes`;
  ingredientList.replaceChildren();
  emptyIngredients.hidden = ingredients.length > 0;

  ingredients.forEach((ingredient) => {
    const row = document.createElement("li");
    row.className = "ingredient-row";

    const name = document.createElement("span");
    name.className = "ingredient-row-name";
    name.textContent = ingredient.name;

    const quantity = document.createElement("span");
    quantity.className = "ingredient-row-quantity";
    quantity.textContent = ingredient.mode === "direct"
      ? "Costo directo"
      : `${ingredient.usedQuantity} ${ingredient.usedUnit}`;

    const cost = document.createElement("strong");
    cost.className = "ingredient-row-cost";
    cost.textContent = formatMoney(ingredient.cost, currency);

    const removeButton = document.createElement("button");
    removeButton.className = "remove-ingredient-button";
    removeButton.type = "button";
    removeButton.textContent = "Eliminar";
    removeButton.setAttribute("aria-label", `Eliminar ${ingredient.name}`);
    removeButton.addEventListener("click", () => {
      ingredients = ingredients.filter((item) => item.id !== ingredient.id);
      renderCalculator();
      saveDraft();
    });

    row.append(name, quantity, cost, removeButton);
    ingredientList.append(row);
  });

  const totals = getCategoryTotals();
  ingredientTotal.textContent = formatMoney(totals.ingredients, currency);
  laborTotal.textContent = formatMoney(totals.labor, currency);
  laborHourlyCost.textContent = formatMoney(totals.laborHourly, currency);
  laborPercentageCost.textContent = formatMoney(totals.laborPercentage, currency);
  laborPercentageLabel.textContent = `${laborPercentageInput.value || 0}%`;
  laborPercentageBase.textContent = formatMoney(totals.preLaborSubtotal, currency);
  const laborMode = document.querySelector("[name='labor-mode']:checked").value;
  laborHoursFields.hidden = laborMode === "percentage";
  laborPercentageFields.hidden = laborMode === "hours";

  COST_CATEGORY_KEYS.forEach((category) => {
    const list = document.querySelector(`[data-cost-list="${category}"]`);
    const emptyMessage = document.querySelector(`[data-cost-empty="${category}"]`);
    const subtotal = document.querySelector(`[data-subtotal="${category}"]`);
    list.replaceChildren();
    emptyMessage.hidden = costLines[category].length > 0;

    costLines[category].forEach((line) => {
      const row = document.createElement("li");
      row.className = "cost-line-row";
      const name = document.createElement("span");
      name.textContent = line.name;
      const amount = document.createElement("strong");
      amount.textContent = formatMoney(line.cost, currency);
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-ingredient-button";
      removeButton.textContent = "Eliminar";
      removeButton.setAttribute("aria-label", `Eliminar ${line.name}`);
      removeButton.addEventListener("click", () => {
        costLines[category] = costLines[category].filter((item) => item.id !== line.id);
        renderCalculator();
        saveDraft();
      });
      row.append(name, amount, removeButton);
      list.append(row);
    });

    totals[category] = roundMoney(costLines[category].reduce((sum, line) => sum + line.cost, 0));
    subtotal.textContent = formatMoney(totals[category], currency);
  });

  const productionCost = roundMoney(
    totals.ingredients + totals.fillings + totals.toppings + totals.decoration
    + totals.packaging + totals.labor + totals.additional,
  );
  productionTotal.textContent = formatMoney(productionCost, currency);
  productionSummaryDetail.textContent = `Ingredientes ${formatMoney(totals.ingredients, currency)} + rellenos ${formatMoney(totals.fillings, currency)} + coberturas y cremas ${formatMoney(totals.toppings, currency)} + decoración ${formatMoney(totals.decoration, currency)} + empaque ${formatMoney(totals.packaging, currency)} + mano de obra ${formatMoney(totals.labor, currency)} + gastos adicionales ${formatMoney(totals.additional, currency)}.`;
  renderSalesPrice(productionCost, currency);
}

function openCalculator() {
  homeSections.forEach((section) => {
    section.hidden = true;
  });
  calculatorView.hidden = false;
  document.querySelector("main").classList.add("is-calculating");
  renderCalculator();
  window.scrollTo({ top: 0, behavior: "smooth" });
  cakeNameInput.focus();
}

function returnHome() {
  calculatorView.hidden = true;
  homeSections.forEach((section) => {
    section.hidden = false;
  });
  document.querySelector("main").classList.remove("is-calculating");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// La preferencia se guarda solo en este navegador; no se usa una cuenta ni una base de datos.
try {
  const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (savedCurrency && CURRENCIES[savedCurrency]) {
    selectedCurrency = savedCurrency;
  }

  const savedRate = localStorage.getItem(RATE_STORAGE_KEY);
  if (savedRate && Number(savedRate) > 0) {
    rateInput.value = savedRate;
    rateMessage.textContent = "Tasa guardada en este navegador. No se aplican conversiones.";
  }

  restoreDraft();
} catch {
  // La pantalla sigue funcionando aunque el navegador bloquee el almacenamiento local.
}

renderCurrency();

currencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCurrency = button.dataset.currency;
    if (!hasCalculationEntries()) {
      calculationCurrency = selectedCurrency;
    }
    renderCurrency();

    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, selectedCurrency);
    } catch {
      // La selección actual sigue activa aunque no se pueda guardar para la próxima visita.
    }
    saveDraft();
  });
});

calculatorCurrencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (hasCalculationEntries()) {
      return;
    }

    selectedCurrency = button.dataset.calculatorCurrency;
    calculationCurrency = selectedCurrency;
    renderCurrency();

    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, selectedCurrency);
    } catch {
      // La moneda elegida sigue activa aunque no se pueda guardar para otra visita.
    }
    saveDraft();
  });
});

cakeNameInput.addEventListener("input", () => {
  cakeNameDisplay.textContent = cakeNameInput.value.trim() || "Tu pastel";
  saveDraft();
});

ingredientCostModeInput.addEventListener("change", () => {
  renderCalculator();
  saveDraft();
});

ingredientForm.addEventListener("input", () => {
  saveDraft();
});
ingredientForm.addEventListener("change", saveDraft);

ingredientForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = ingredientNameInput.value.trim();
  let cost;

  if (!cakeNameInput.value.trim()) {
    ingredientError.textContent = "Escribe el nombre del pastel antes de agregar ingredientes.";
    cakeNameInput.focus();
    return;
  }

  if (!name) {
    ingredientError.textContent = "Escribe el nombre del ingrediente.";
    return;
  }

  if (ingredientCostModeInput.value === "direct") {
    const directCost = Number(ingredientDirectCostInput.value);
    if (!ingredientDirectCostInput.value || !Number.isFinite(directCost) || directCost < 0) {
      ingredientError.textContent = "Escribe un costo directo igual o mayor que cero.";
      return;
    }
    cost = roundMoney(directCost);
  } else {
    const packagePrice = Number(packagePriceInput.value);
    const packageQuantity = Number(packageQuantityInput.value);
    const usedQuantity = Number(usedQuantityInput.value);
    const packageUnit = packageUnitInput.value;
    const usedUnit = usedUnitInput.value;

    if (!packagePriceInput.value || !packageQuantityInput.value || !usedQuantityInput.value || !packageUnit || !usedUnit) {
      ingredientError.textContent = "Completa el precio, las cantidades y las dos unidades.";
      return;
    }

    if (!Number.isFinite(packagePrice) || !Number.isFinite(packageQuantity) || !Number.isFinite(usedQuantity)
      || packagePrice <= 0 || packageQuantity <= 0 || usedQuantity <= 0) {
      ingredientError.textContent = "El precio y las dos cantidades deben ser mayores que cero.";
      return;
    }

    if (UNITS[packageUnit].family !== UNITS[usedUnit].family) {
      ingredientError.textContent = "No se pueden mezclar peso, volumen y unidades individuales. Elige unidades equivalentes.";
      return;
    }

    const packageBaseQuantity = packageQuantity * UNITS[packageUnit].factor;
    const usedBaseQuantity = usedQuantity * UNITS[usedUnit].factor;
    cost = roundMoney((packagePrice * usedBaseQuantity) / packageBaseQuantity);

    ingredients.push({
      id: nextIngredientId,
      name,
      mode: "quantity",
      packagePrice,
      packageQuantity,
      packageUnit,
      usedQuantity,
      usedUnit,
      currency: calculationCurrency,
      cost,
    });
  }

  if (ingredientCostModeInput.value === "direct") {
    ingredients.push({
    id: nextIngredientId,
    name,
      mode: "direct",
      currency: calculationCurrency,
      cost,
    });
  }

  nextIngredientId += 1;

  ingredientError.textContent = "";
  ingredientForm.reset();
  renderCalculator();
  saveDraft();
  ingredientNameInput.focus();
});

document.querySelectorAll("[data-cost-form]").forEach((form) => {
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const category = form.dataset.costForm;
    const nameInput = form.elements.namedItem("name");
    const costInput = form.elements.namedItem("cost");
    const name = nameInput.value.trim();
    const cost = Number(costInput.value);
    const errorMessage = form.querySelector("[data-form-error]");

    if (!name || !costInput.value) {
      errorMessage.textContent = "Escribe el nombre y el costo de la partida.";
      return;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      errorMessage.textContent = "El costo no puede ser negativo.";
      return;
    }

    costLines[category].push({
      id: nextCostLineId,
      name,
      cost: roundMoney(cost),
      currency: calculationCurrency,
    });
    nextCostLineId += 1;
    errorMessage.textContent = "";
    form.reset();
    renderCalculator();
    saveDraft();
    nameInput.focus();
  });
});

document.querySelectorAll(".labor-input").forEach((input) => {
  input.addEventListener("input", () => {
    renderCalculator();
    saveDraft();
  });
});

laborModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    renderCalculator();
    saveDraft();
  });
});

profitPercentageInput.addEventListener("input", () => {
  renderCalculator();
  saveDraft();
});

profitQuickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    profitPercentageInput.value = button.dataset.profitPercentage;
    renderCalculator();
    saveDraft();
  });
});

backHomeButton.addEventListener("click", returnHome);

rateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const rate = Number(rateInput.value);

  if (!Number.isFinite(rate) || rate <= 0) {
    rateMessage.textContent = "Escribe una tasa mayor que cero para guardarla.";
    rateMessage.classList.add("is-error");
    return;
  }

  try {
    localStorage.setItem(RATE_STORAGE_KEY, String(rate));
    rateMessage.textContent = "Tasa guardada en este navegador. No se aplican conversiones.";
    rateMessage.classList.remove("is-error");
  } catch {
    rateMessage.textContent = "No se pudo guardar la tasa en este navegador.";
    rateMessage.classList.add("is-error");
  }
});

const featureDetails = {
  calculo: {
    title: "Nuevo cálculo",
    description: "Aquí podrás calcular el costo y el precio de venta de tus pasteles. Esta primera pantalla todavía no guarda cálculos.",
  },
  ingredientes: {
    title: "Mis ingredientes",
    description: "En esta sección podrás registrar ingredientes y sus precios en la moneda que elijas.",
  },
  recetas: {
    title: "Mis recetas",
    description: "Aquí podrás reunir tus recetas y consultar sus costos manteniendo la moneda de cada registro.",
  },
  historial: {
    title: "Historial",
    description: "Más adelante podrás consultar tus cálculos anteriores y la moneda utilizada en cada uno.",
  },
};

document.querySelectorAll("[data-feature]").forEach((button) => {
  button.addEventListener("click", () => {
    const feature = featureDetails[button.dataset.feature];

    if (button.dataset.feature === "calculo") {
      openCalculator();
      return;
    }

    dialogTitle.textContent = feature.title;
    dialogDescription.textContent = feature.description;
    featureDialog.showModal();
  });
});

document.querySelector("#dialog-done").addEventListener("click", () => {
  featureDialog.close();
});