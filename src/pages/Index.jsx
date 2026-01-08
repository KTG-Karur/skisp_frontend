import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Enhanced debug logging
const debugLog = (label, data) => {
    console.log(`🔍 [${label}]`, data);
    return data;
};

// Get local date string (YYYY-MM-DD) from any date input - SIMPLIFIED VERSION
const getLocalDateString = (dateInput) => {
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string') {
        // If it's already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateInput);
        }
    } else {
        date = new Date();
    }

    if (isNaN(date.getTime())) {
        console.error('❌ Invalid date in getLocalDateString:', dateInput);
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const TaskManagementDashboard = () => {
            <h1>hi</h1>
};

export default TaskManagementDashboard;