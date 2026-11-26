
"use strict";

// ==============================
// ELEMENTOS
// ==============================

const welcomeScreen = document.getElementById("welcome-screen");
const calculatorScreen = document.getElementById("calculator-screen");

const startButton = document.getElementById("start-button");
const exitButton = document.getElementById("exit-button");
const backButton = document.getElementById("back-button");

const display = document.getElementById("display");
const history = document.getElementById("history");

const buttons = document.querySelector(".buttons");


// ==============================
// ESTADO DA CALCULADORA
// ==============================

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNextValue = false;
let lastOperation = null;
let hasError = false;


// ==============================
// NAVEGAÇÃO
// ==============================

startButton.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    calculatorScreen.classList.remove("hidden");

    resetCalculator();
});

exitButton.addEventListener("click", () => {
    window.location.href = "https://www.google.com/";
});

backButton.addEventListener("click", () => {
    calculatorScreen.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
});


// ==============================
// FORMATAÇÃO DO VISOR
// ==============================

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "Erro";
    }

    if (Math.abs(number) >= 1e12 || 
        (Math.abs(number) > 0 && Math.abs(number) < 1e-7)) {
        return number.toExponential(5);
    }

    return String(Number(number.toPrecision(12)));
}


function updateDisplay() {
    display.textContent = formatNumber(currentValue);
}


// ==============================
// LIMPAR CALCULADORA
// ==============================

function resetCalculator() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    waitingForNextValue = false;
    lastOperation = null;
    hasError = false;

    history.textContent = "CALCULADORA PRONTA";

    updateDisplay();
}


// ==============================
// DIGITAR NÚMEROS
// ==============================

function inputNumber(number) {
    if (hasError) {
        resetCalculator();
    }

    if (waitingForNextValue) {
        currentValue = number;
        waitingForNextValue = false;
    } else if (currentValue.replace("-", "").replace(".", "").length >= 12) {
        return;
    } else {
        currentValue = currentValue === "0"
            ? number
            : currentValue + number;
    }

    updateDisplay();
}


// ==============================
// NÚMEROS DECIMAIS
// ==============================

function inputDecimal() {
    if (hasError) {
        resetCalculator();
    }

    if (waitingForNextValue) {
        currentValue = "0.";
        waitingForNextValue = false;
        updateDisplay();
        return;
    }

    if (!currentValue.includes(".")) {
        currentValue += ".";
        updateDisplay();
    }
}


// ==============================
// OPERAÇÕES MATEMÁTICAS
// ==============================

function calculate(first, second, operation) {
    switch (operation) {
        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":
            if (second === 0) {
                return null;
            }

            return first / second;

        default:
            return second;
    }
}


// ==============================
// ESCOLHER OPERADOR
// ==============================

function chooseOperator(nextOperator) {
    if (hasError) {
        return;
    }

    const inputValue = Number(currentValue);

    if (operator && !waitingForNextValue) {
        const result = calculate(
            previousValue,
            inputValue,
            operator
        );

        if (result === null || !Number.isFinite(result)) {
            showError();
            return;
        }

        currentValue = String(result);
        updateDisplay();

        previousValue = result;

    } else {
        previousValue = inputValue;
    }

    operator = nextOperator;
    waitingForNextValue = true;
    lastOperation = null;

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    history.textContent =
        `${formatNumber(previousValue)} ${symbols[nextOperator]}`;
}


// ==============================
// RESULTADO
// ==============================

function calculateResult() {
    if (hasError) {
        return;
    }

    if (operator === null || previousValue === null) {
        return;
    }

    const secondValue = waitingForNextValue
        ? previousValue
        : Number(currentValue);

    const firstValue = previousValue;
    const selectedOperator = operator;

    const result = calculate(
        firstValue,
        secondValue,
        selectedOperator
    );

    if (result === null || !Number.isFinite(result)) {
        showError();
        return;
    }

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    history.textContent =
        `${formatNumber(firstValue)} ${symbols[selectedOperator]} ${formatNumber(secondValue)} =`;

    currentValue = String(result);

    lastOperation = {
        operator: selectedOperator,
        value: secondValue
    };

    previousValue = null;
    operator = null;
    waitingForNextValue = true;

    updateDisplay();
}


// ==============================
// PORCENTAGEM
// ==============================

function calculatePercentage() {
    if (hasError) {
        return;
    }

    const value = Number(currentValue);

    let result;

    if (operator && previousValue !== null) {
        result = previousValue * value / 100;
    } else {
        result = value / 100;
    }

    currentValue = String(result);
    updateDisplay();
}


// ==============================
// ALTERAR SINAL
// ==============================

function changeSign() {
    if (hasError || Number(currentValue) === 0) {
        return;
    }

    currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : "-" + currentValue;

    updateDisplay();
}


// ==============================
// APAGAR ÚLTIMO DÍGITO
// ==============================

function deleteLastDigit() {
    if (hasError) {
        resetCalculator();
        return;
    }

    if (waitingForNextValue) {
        return;
    }

    currentValue = currentValue.length > 1
        ? currentValue.slice(0, -1)
        : "0";

    if (currentValue === "-") {
        currentValue = "0";
    }

    updateDisplay();
}


// ==============================
// ERROS
// ==============================

function showError() {
    currentValue = "Erro";
    previousValue = null;
    operator = null;
    waitingForNextValue = true;
    lastOperation = null;
    hasError = true;

    display.textContent = "Erro";
    history.textContent = "OPERAÇÃO INVÁLIDA";
}


// ==============================
// AÇÕES DOS BOTÕES
// ==============================

function handleAction(action) {
    switch (action) {
        case "clear":
            resetCalculator();
            break;

        case "delete":
            deleteLastDigit();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "equals":
            calculateResult();
            break;

        case "percent":
            calculatePercentage();
            break;

        case "sign":
            changeSign();
            break;
    }
}


// ==============================
// CLIQUES NO TECLADO
// ==============================

buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    if (button.dataset.action) {
        handleAction(button.dataset.action);
    }
});


// ==============================
// TECLADO DO CELULAR / PC
// ==============================

document.addEventListener("keydown", (event) => {

    if (calculatorScreen.classList.contains("hidden")) {
        return;
    }

    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputNumber(key);
        return;
    }

    if (key === "." || key === ",") {
        inputDecimal();
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        chooseOperator(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateResult();
        return;
    }

    if (key === "Backspace") {
        deleteLastDigit();
        return;
    }

    if (key === "Escape") {
        resetCalculator();
        return;
    }

    if (key === "%") {
        calculatePercentage();
    }

});
