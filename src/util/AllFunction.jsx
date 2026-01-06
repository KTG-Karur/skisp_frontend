import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import moment from 'moment';
import _ from 'lodash';
import ReactDOMServer from 'react-dom/server';

const showMessage = (type, msg, callback = null) => {
    if (type === 'warning' && callback) {
        Swal.fire({
            title: 'Are you sure?',
            text: msg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, Continue',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'animated-confirm-popup',
                confirmButton: 'animated-confirm-btn',
                cancelButton: 'animated-cancel-btn',
                actions: 'animated-actions-container',
            },
            showClass: {
                popup: 'swal2-show-animated',
                backdrop: 'swal2-backdrop-show-animated',
            },
            hideClass: {
                popup: 'swal2-hide-animated',
                backdrop: 'swal2-backdrop-hide-animated',
            },
        }).then((result) => {
            if (result.isConfirmed) {
                callback();
            }
        });
    } else {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                popup: 'animated-toast-popup',
            },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
        });

        const toastConfig = {
            success: {
                icon: 'success',
                background: '#10b981',
                iconColor: '#ffffff',
                color: '#ffffff',
            },
            error: {
                icon: 'error',
                background: '#ef4444',
                iconColor: '#ffffff',
                color: '#ffffff',
            },
            warning: {
                icon: 'warning',
                background: '#f59e0b',
                iconColor: '#ffffff',
                color: '#ffffff',
            },
            info: {
                icon: 'info',
                background: '#3b82f6',
                iconColor: '#ffffff',
                color: '#ffffff',
            },
        };

        const config = toastConfig[type] || toastConfig.info;

        toast.fire({
            icon: config.icon,
            title: msg,
            background: config.background,
            iconColor: config.iconColor,
            color: config.color,
        });
    }
};

const showConfirmationDialog = async (message, confirmButtonText = 'Yes, Continue') => {
    let confirm = false;

    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: confirmButtonText,
            cancelButtonText: 'Cancel',
        });
        confirm = result.isConfirmed;
    } catch (error) {
        // empty
    }

    return confirm;
};

// Inject animated styles
const injectAnimatedStyles = () => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = `
      /* Animated Confirm Popup */
      .animated-confirm-popup {
        border-radius: 12px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        border: 1px solid #e5e7eb !important;
        animation: popup-glow 2s ease-in-out infinite alternate !important;
      }
      
      /* Animated Confirm Button */
      .animated-confirm-btn {
        background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3) !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .animated-confirm-btn:hover {
        background: linear-gradient(135deg, #b91c1c, #991b1b) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 15px -3px rgba(220, 38, 38, 0.4) !important;
      }
      
      .animated-confirm-btn:active {
        transform: translateY(0) !important;
      }
      
      .animated-confirm-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }
      
      .animated-confirm-btn:hover::before {
        left: 100%;
      }
      
      /* Animated Cancel Button */
      .animated-cancel-btn {
        background: linear-gradient(135deg, #3085d6, #1e40af) !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 6px -1px rgba(48, 133, 214, 0.3) !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .animated-cancel-btn:hover {
        background: linear-gradient(135deg, #1e40af, #1e3a8a) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 15px -3px rgba(48, 133, 214, 0.4) !important;
      }
      
      .animated-cancel-btn:active {
        transform: translateY(0) !important;
      }
      
      .animated-cancel-btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s ease, height 0.3s ease;
      }
      
      .animated-cancel-btn:hover::after {
        width: 100px;
        height: 100px;
      }
      
      /* Actions Container */
      .animated-actions-container {
        gap: 12px !important;
        margin-top: 20px !important;
      }
      
      /* Toast Styles */
      .animated-toast-popup {
        border-radius: 8px !important;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      /* Animations */
      .swal2-show-animated {
        animation: swal2-show-animated 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }
      
      .swal2-hide-animated {
        animation: swal2-hide-animated 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      }
      
      @keyframes swal2-show-animated {
        0% {
          transform: scale(0.8) translateY(-20px);
          opacity: 0;
        }
        50% {
          transform: scale(1.05) translateY(5px);
        }
        100% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes swal2-hide-animated {
        0% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
        100% {
          transform: scale(0.8) translateY(-20px);
          opacity: 0;
        }
      }
      
      /* Backdrop Animations */
      .swal2-backdrop-show-animated {
        animation: swal2-backdrop-show-animated 0.3s ease-out !important;
        background: rgba(0, 0, 0, 0.5) !important;
        backdrop-filter: blur(4px) !important;
      }
      
      @keyframes swal2-backdrop-show-animated {
        0% {
          background: transparent;
          backdrop-filter: blur(0px);
        }
        100% {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
      }
      
      .swal2-backdrop-hide-animated {
        animation: swal2-backdrop-hide-animated 0.3s ease-in !important;
      }
      
      @keyframes swal2-backdrop-hide-animated {
        0% {
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        100% {
          background: transparent;
          backdrop-filter: blur(0px);
        }
      }
      
      /* Popup Glow Effect */
      @keyframes popup-glow {
        0% {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        100% {
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.1);
        }
      }
      
      /* Focus states for accessibility */
      .animated-confirm-btn:focus,
      .animated-cancel-btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `;
        document.head.appendChild(style);
    }
};

injectAnimatedStyles();

const findMultiSelectObj = (optionList, uniqueKey, selectedValues) => {
    if (selectedValues) {
        return optionList.filter((option) => selectedValues.includes(option[uniqueKey]));
    }
};

const amountFormat = (amount) => {
    let formattedNumber = parseInt(amount).toFixed(2);
    return formattedNumber;
};

const getFormFieldName = (dynamicForm) => {
    let arr = [];
    dynamicForm.forEach((formDataArr) => {
        formDataArr?.formFields.forEach((subFormData) => {
            if (subFormData?.require) {
                arr.push(subFormData?.name);
            }
        });
    });

    return arr;
};

function fiscalYear(inputDate) {
    const date = moment(inputDate).year();
    let startYear = date;
    let endYear = startYear + 1;
    const fiscalYear = `${startYear}-${endYear.toString().slice(-2)}`;
    return fiscalYear;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function noOfDayCount(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const differenceInTime = to.getTime() - from.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return differenceInDays + 1;
}

function timerAmPm(time = '') {
    const [hours, minutes] = time.split(':');
    const isPM = hours >= 12;
    const formattedTime = `${(hours % 12 || 12).toString().padStart(2, '0')}:${minutes} ${isPM ? 'PM' : 'AM'}`;
    return formattedTime;
}

function DateMonthYear(date) {
    const ddmmyyyy = date.split('-');
    const d = ddmmyyyy[2];
    const m = ddmmyyyy[1];
    const y = ddmmyyyy[0];
    return `${d}-${m}-${y}`;
}

function updateData(arr, id, newState) {
    return arr.map((item) => (item.id === id ? newState : item));
}

function deleteData(arr, id, accessKey = null) {
    if (accessKey != null) {
        return arr.filter((item) => {
            return item[accessKey] !== id;
        });
    }
    return arr.filter((item) => {
        return item.id !== id;
    });
}

function deleteIndexData(arr, id) {
    return arr.filter((item, i) => {
        return i !== id;
    });
}

const removeExistsList = async (allList, existsArrayList, key) => {
    const list = allList.filter((item) => !existsArrayList.some((existsItem) => existsItem[key] === item[key]));
    return list;
};

function findObj(optionList = [], accessKey, value = '') {
    const filterData = optionList.filter((item) => item[accessKey] === value);
    return filterData.length > 0 ? filterData[0] : '';
}

function findArrObj(arr, accessKey, id) {
    return arr.filter((item) => item[accessKey] === id);
}

function inclusiveGst(price, tax) {
    price = Number(price);
    tax = Number(tax);
    return parseFloat((price * 100) / (100 + tax)).toFixed(2);
}

function exclusiveGst(price, tax) {
    price = Number(price);
    tax = Number(tax);
    return parseFloat(price * (1 + tax / 100)).toFixed(2);
}

function gstValueInclusive(price, tax) {
    price = Number(price);
    tax = Number(tax);
    return parseFloat((price * tax) / (100 + tax)).toFixed(2);
}
function gstValueExclusive(price, tax) {
    price = Number(price);
    tax = Number(tax);
    return parseFloat((price * tax) / 100).toFixed(2);
}

function percentageVal(amount, percentage) {
    return (parseFloat(amount) * parseFloat(percentage)) / 100;
}

function ValtoPercentage(chargeAmount, loanAmt) {
    return (parseFloat(chargeAmount) / parseFloat(loanAmt)) * 100;
}

const dateConversion = (date, format = 'DD-MM-YYYY') => {
    const result = date ? moment(date).format(format) : '';
    return result;
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatGrandTotal(amount, withSymbol = false) {
    const formatted = Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return withSymbol ? `₹${formatted}` : formatted;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function objectToKeyValueArray(obj) {
    return obj.map(([key, value]) => ({ Key: key, Value: value }));
}

// Rest of your existing functions (emi calculations, etc.) remain unchanged...
const annualToMonthlyInterestRate = (annualInterest) => {
    const r = annualInterest / (12 * 100);
    return r;
};

const emiCalculation = (principal, annualInterest, tenurePeriod) => {
    const p = parseFloat(principal);
    const r = annualToMonthlyInterestRate(annualInterest);
    const t = parseFloat(tenurePeriod) * 12;

    const emi = (p * r * Math.pow(1 + r, t)) / (Math.pow(1 + r, t) - 1);

    return emi;
};

const findDueDate = (disbursedDate = formatDate()) => {
    return moment(disbursedDate).add(1, 'months').date(10).format('YYYY-MM-DD');
};

const findLastDate = (disbursedDate = formatDate(), tenurePeriod) => {
    const disbursedDateArr = disbursedDate.split('-');
    let year = parseInt(disbursedDateArr[0]);
    let month = parseInt(disbursedDateArr[1]);
    let day = 10;

    let additionalYears = Math.floor(tenurePeriod / 12);
    let additionalMonths = tenurePeriod % 12;

    year += additionalYears;
    month += additionalMonths;

    if (month > 12) {
        year += 1;
        month -= 12;
    }

    month = month < 10 ? `0${month}` : month;

    return `${year}-${month}-${day}`;
};

const interestForMonth = (remainingPrincipal, monthlyInterestRate) => {
    const monthInterest = parseFloat(remainingPrincipal * monthlyInterestRate);
    return monthInterest;
};

const principalRepayment = (emi, monthInterest) => {
    const principalRepay = parseFloat(emi - monthInterest);
    return principalRepay;
};

const principalRemaining = (remainingPrincipal, principalRepayment) => {
    const principalRemain = parseFloat(remainingPrincipal - principalRepayment);
    return principalRemain;
};

const calculateTotalInterestPayable = (principal, annualInterest, tenurePeriod) => {
    let totalInterestPayable = 0;
    let remainingPrincipal = principal;
    const monthlyInterestRate = annualToMonthlyInterestRate(annualInterest);
    const emi = emiCalculation(principal, annualInterest, tenurePeriod);

    for (let month = 1; month <= tenurePeriod * 12; month++) {
        const monthInterestAmount = interestForMonth(remainingPrincipal, monthlyInterestRate);
        const principalRepay = principalRepayment(emi, monthInterestAmount);
        remainingPrincipal = principalRemaining(remainingPrincipal, principalRepay);

        totalInterestPayable += monthInterestAmount;
    }

    return totalInterestPayable;
};

const removeNullKeyFromObj = (data) => {
    let result = '';
    if (Array.isArray(data)) {
        result = data.map((obj) => _.omitBy(obj, (value) => value === null));
    } else {
        result = _.omitBy(data, (value) => value === null);
    }
    return result;
};

function numberToRupeesWords(number) {
    const ones = [
        '',
        'One',
        'Two',
        'Three',
        'Four',
        'Five',
        'Six',
        'Seven',
        'Eight',
        'Nine',
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    let numStr = number.toString();

    function convertThreeDigits(num) {
        let str = '';
        if (num >= 100) {
            str += ones[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num >= 20) {
            str += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 0) {
            str += ones[num] + ' ';
        }
        return str.trim();
    }

    if (number === 0) return 'Zero Rupees';

    let words = '';
    let partCount = 0;

    while (numStr.length > 0) {
        let part = numStr.slice(-3);
        numStr = numStr.slice(0, -3);

        if (parseInt(part) > 0) {
            words = convertThreeDigits(parseInt(part)) + ' ' + thousands[partCount] + ' ' + words;
        }
        partCount++;
    }
    words = words.trim() + ' Rupees';

    return words;
}

export {
    formatGrandTotal,
    inclusiveGst,
    exclusiveGst,
    gstValueInclusive,
    gstValueExclusive,
    showMessage,
    removeNullKeyFromObj,
    getFormFieldName,
    formatDate,
    showConfirmationDialog,
    updateData,
    deleteData,
    removeExistsList,
    findObj,
    findArrObj,
    percentageVal,
    ValtoPercentage,
    dateConversion,
    findLastDate,
    findDueDate,
    findMultiSelectObj,
    emiCalculation,
    interestForMonth,
    principalRepayment,
    principalRemaining,
    annualToMonthlyInterestRate,
    calculateTotalInterestPayable,
    numberWithCommas,
    DateMonthYear,
    amountFormat,
    capitalizeFirstLetter,
    objectToKeyValueArray,
    noOfDayCount,
    timerAmPm,
    numberToRupeesWords,
    fiscalYear,
    deleteIndexData,
};
