class Calculator {
    constructor() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
        this.shouldResetScreen = false;
        
        this.currentOperandElement = document.getElementById('currentOperand');
        this.previousOperandElement = document.getElementById('previousOperand');
        
        this.init();
    }
    
    init() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e);
                this.handleButton(button);
            });
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    createRipple(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    handleButton(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        switch(action) {
            case 'number':
                this.appendNumber(value);
                break;
            case 'operator':
                this.setOperation(value);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
        }
        
        this.updateDisplay();
    }
    
    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9' || e.key === '.') {
            this.appendNumber(e.key);
        } else if (e.key === '+' || e.key === '-') {
            this.setOperation(e.key === '-' ? '−' : e.key);
        } else if (e.key === '*') {
            this.setOperation('×');
        } else if (e.key === '/') {
            e.preventDefault();
            this.setOperation('÷');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === 'Backspace') {
            this.delete();
        }
        
        this.updateDisplay();
    }
    
    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }
    
    setOperation(op) {
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.calculate();
        }
        
        this.operation = op;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }
    
    calculate() {
        if (!this.operation || this.shouldResetScreen) return;
        
        let result;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch(this.operation) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Handle floating point precision and very large numbers
        if (!isFinite(result)) {
            this.currentOperand = 'Error';
        } else if (Math.abs(result) >= Number.MAX_SAFE_INTEGER) {
            this.currentOperand = result.toExponential(10);
        } else {
            result = Math.round(result * 1000000000) / 1000000000;
            this.currentOperand = result.toString();
        }
        this.operation = null;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }
    
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = null;
    }
    
    delete() {
        if (this.shouldResetScreen) return;
        
        this.currentOperand = this.currentOperand.slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }
    
    updateDisplay() {
        this.currentOperandElement.textContent = this.formatNumber(this.currentOperand);
        
        if (this.operation) {
            this.previousOperandElement.textContent = 
                `${this.formatNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
    
    formatNumber(number) {
        if (number === '') return '0';
        
        const numStr = number.toString();
        
        // Handle very large or very small numbers with scientific notation
        const num = parseFloat(numStr);
        if (!isNaN(num) && (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0))) {
            return num.toExponential(6);
        }
        
        const parts = numStr.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return parts.join('.');
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
