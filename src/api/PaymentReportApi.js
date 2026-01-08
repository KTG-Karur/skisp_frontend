import axios from 'axios';

// Mock data for development
const mockPaymentData = [
    {
        paymentId: "PAY-001",
        invoiceNumber: "INV-2023-001",
        clientId: "CL-001",
        clientName: "ABC Corporation",
        projectName: "Website Redesign",
        amount: 50000,
        paidAmount: 30000,
        pendingAmount: 20000,
        paymentDate: "2023-10-15",
        dueDate: "2023-11-15",
        status: "partial",
        paymentMethod: "bank_transfer",
        transactionId: "TX123456789",
        description: "Partial payment for phase 1",
        createdBy: "John Doe",
        createdAt: "2023-10-10",
        assignedTo: "EMP-001",
    },
    {
        paymentId: "PAY-002",
        invoiceNumber: "INV-2023-002",
        clientId: "CL-002",
        clientName: "XYZ Ltd",
        projectName: "Mobile App Development",
        amount: 75000,
        paidAmount: 75000,
        pendingAmount: 0,
        paymentDate: "2023-10-20",
        dueDate: "2023-10-20",
        status: "paid",
        paymentMethod: "online",
        transactionId: "TX987654321",
        description: "Full payment for project completion",
        createdBy: "Jane Smith",
        createdAt: "2023-10-05",
        assignedTo: "EMP-002",
    },
    {
        paymentId: "PAY-003",
        invoiceNumber: "INV-2023-003",
        clientId: "CL-003",
        clientName: "Tech Solutions Inc",
        projectName: "CRM Implementation",
        amount: 100000,
        paidAmount: 0,
        pendingAmount: 100000,
        paymentDate: null,
        dueDate: "2023-10-25",
        status: "pending",
        paymentMethod: null,
        transactionId: null,
        description: "Pending payment for phase 2",
        createdBy: "Mike Johnson",
        createdAt: "2023-10-01",
        assignedTo: "EMP-003",
    },
    {
        paymentId: "PAY-004",
        invoiceNumber: "INV-2023-004",
        clientId: "CL-004",
        clientName: "Global Enterprises",
        projectName: "ERP System",
        amount: 150000,
        paidAmount: 50000,
        pendingAmount: 100000,
        paymentDate: "2023-09-15",
        dueDate: "2023-09-10",
        status: "overdue",
        paymentMethod: "cheque",
        transactionId: "CHQ123456",
        description: "Partial payment, balance overdue",
        createdBy: "Sarah Williams",
        createdAt: "2023-09-01",
        assignedTo: "EMP-004",
    },
    {
        paymentId: "PAY-005",
        invoiceNumber: "INV-2023-005",
        clientId: "CL-001",
        clientName: "ABC Corporation",
        projectName: "SEO Services",
        amount: 25000,
        paidAmount: 25000,
        pendingAmount: 0,
        paymentDate: "2023-10-05",
        dueDate: "2023-10-05",
        status: "paid",
        paymentMethod: "card",
        transactionId: "CRD789012",
        description: "Monthly SEO retainer",
        createdBy: "John Doe",
        createdAt: "2023-09-25",
        assignedTo: "EMP-001",
    },
    {
        paymentId: "PAY-006",
        invoiceNumber: "INV-2023-006",
        clientId: "CL-005",
        clientName: "StartUp Ventures",
        projectName: "MVP Development",
        amount: 80000,
        paidAmount: 40000,
        pendingAmount: 40000,
        paymentDate: "2023-10-12",
        dueDate: "2023-10-31",
        status: "partial",
        paymentMethod: "cash",
        transactionId: "CASH001",
        description: "50% advance payment",
        createdBy: "Robert Brown",
        createdAt: "2023-10-01",
        assignedTo: "EMP-005",
    },
    {
        paymentId: "PAY-007",
        invoiceNumber: "INV-2023-007",
        clientId: "CL-002",
        clientName: "XYZ Ltd",
        projectName: "API Integration",
        amount: 35000,
        paidAmount: 0,
        pendingAmount: 35000,
        paymentDate: null,
        dueDate: "2023-10-18",
        status: "overdue",
        paymentMethod: null,
        transactionId: null,
        description: "Payment overdue for integration work",
        createdBy: "Jane Smith",
        createdAt: "2023-09-20",
        assignedTo: "EMP-002",
    },
    {
        paymentId: "PAY-008",
        invoiceNumber: "INV-2023-008",
        clientId: "CL-006",
        clientName: "HealthCare Plus",
        projectName: "Hospital Management System",
        amount: 200000,
        paidAmount: 100000,
        pendingAmount: 100000,
        paymentDate: "2023-10-08",
        dueDate: "2023-11-08",
        status: "partial",
        paymentMethod: "bank_transfer",
        transactionId: "BANK20231008",
        description: "50% milestone payment",
        createdBy: "Emily Davis",
        createdAt: "2023-10-01",
        assignedTo: "EMP-006",
    },
    {
        paymentId: "PAY-009",
        invoiceNumber: "INV-2023-009",
        clientId: "CL-007",
        clientName: "EduTech Solutions",
        projectName: "Learning Platform",
        amount: 120000,
        paidAmount: 120000,
        pendingAmount: 0,
        paymentDate: "2023-10-22",
        dueDate: "2023-10-22",
        status: "paid",
        paymentMethod: "online",
        transactionId: "ONL20231022",
        description: "Full and final payment",
        createdBy: "David Wilson",
        createdAt: "2023-10-15",
        assignedTo: "EMP-007",
    },
    {
        paymentId: "PAY-010",
        invoiceNumber: "INV-2023-010",
        clientId: "CL-008",
        clientName: "Retail Chain Corp",
        projectName: "Inventory System",
        amount: 90000,
        paidAmount: 0,
        pendingAmount: 90000,
        paymentDate: null,
        dueDate: "2023-11-05",
        status: "pending",
        paymentMethod: null,
        transactionId: null,
        description: "Payment pending for delivery",
        createdBy: "Michael Taylor",
        createdAt: "2023-10-10",
        assignedTo: "EMP-008",
    },
    {
        paymentId: "PAY-011",
        invoiceNumber: "INV-2023-011",
        clientId: "CL-003",
        clientName: "Tech Solutions Inc",
        projectName: "Cloud Migration",
        amount: 180000,
        paidAmount: 90000,
        pendingAmount: 90000,
        paymentDate: "2023-09-30",
        dueDate: "2023-10-30",
        status: "partial",
        paymentMethod: "bank_transfer",
        transactionId: "BANK20230930",
        description: "50% advance for cloud migration",
        createdBy: "Mike Johnson",
        createdAt: "2023-09-25",
        assignedTo: "EMP-003",
    },
    {
        paymentId: "PAY-012",
        invoiceNumber: "INV-2023-012",
        clientId: "CL-004",
        clientName: "Global Enterprises",
        projectName: "Data Analytics",
        amount: 95000,
        paidAmount: 95000,
        pendingAmount: 0,
        paymentDate: "2023-10-18",
        dueDate: "2023-10-18",
        status: "paid",
        paymentMethod: "online",
        transactionId: "ONL20231018",
        description: "Data analytics project completion",
        createdBy: "Sarah Williams",
        createdAt: "2023-10-10",
        assignedTo: "EMP-004",
    },
    {
        paymentId: "PAY-013",
        invoiceNumber: "INV-2023-013",
        clientId: "CL-009",
        clientName: "Manufacturing Corp",
        projectName: "IoT Implementation",
        amount: 225000,
        paidAmount: 75000,
        pendingAmount: 150000,
        paymentDate: "2023-10-05",
        dueDate: "2023-11-05",
        status: "partial",
        paymentMethod: "cheque",
        transactionId: "CHQ789012",
        description: "First installment for IoT project",
        createdBy: "Thomas Anderson",
        createdAt: "2023-09-28",
        assignedTo: "EMP-009",
    },
    {
        paymentId: "PAY-014",
        invoiceNumber: "INV-2023-014",
        clientId: "CL-010",
        clientName: "Logistics Network",
        projectName: "Tracking System",
        amount: 125000,
        paidAmount: 0,
        pendingAmount: 125000,
        paymentDate: null,
        dueDate: "2023-10-12",
        status: "overdue",
        paymentMethod: null,
        transactionId: null,
        description: "Overdue payment for tracking system",
        createdBy: "Lisa Wong",
        createdAt: "2023-09-15",
        assignedTo: "EMP-010",
    },
    {
        paymentId: "PAY-015",
        invoiceNumber: "INV-2023-015",
        clientId: "CL-001",
        clientName: "ABC Corporation",
        projectName: "Maintenance Contract",
        amount: 45000,
        paidAmount: 45000,
        pendingAmount: 0,
        paymentDate: "2023-10-28",
        dueDate: "2023-10-28",
        status: "paid",
        paymentMethod: "card",
        transactionId: "CRD20231028",
        description: "Annual maintenance contract",
        createdBy: "John Doe",
        createdAt: "2023-10-20",
        assignedTo: "EMP-001",
    },
];

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token') || '';
};

// Helper function to get config for API calls
const getConfig = () => {
    const token = getAuthToken();
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    };
};

// Helper function to filter mock data
const filterMockData = (data, filters) => {
    let filteredData = [...data];

    // if (!filters || Object.keys(filters).length === 0) {
    //     return filteredData;
    // }

    // // Filter by report type (status)
    // if (filters.status) {
    //     if (filters.status === 'pending') {
    //         const today = new Date();
    //         filteredData = filteredData.filter(payment => {
    //             const dueDate = new Date(payment.dueDate);
    //             return payment.status === 'pending' && dueDate >= today;
    //         });
    //     } else if (filters.status === 'overdue') {
    //         const today = new Date();
    //         filteredData = filteredData.filter(payment => {
    //             const dueDate = new Date(payment.dueDate);
    //             return (payment.status === 'pending' || payment.status === 'overdue') && dueDate < today;
    //         });
    //     } else if (filters.status === 'paid') {
    //         filteredData = filteredData.filter(payment => payment.status === 'paid');
    //     } else if (filters.status === 'all') {
    //         // Show all
    //     } else {
    //         filteredData = filteredData.filter(payment => payment.status === filters.status);
    //     }
    // }

    // // Filter by employee (assignedTo)
    // if (filters.assignedTo || filters.createdBy) {
    //     const employeeId = filters.assignedTo || filters.createdBy;
    //     filteredData = filteredData.filter(payment => {
    //         // Check both assignedTo and if we have a createdBy field
    //         return payment.assignedTo === employeeId ||
    //             (payment.createdBy && payment.createdBy === employeeId);
    //     });
    // }

    // // Filter by client
    // if (filters.clientId) {
    //     filteredData = filteredData.filter(payment => payment.clientId === filters.clientId);
    // }

    // // Filter by date range for payment date or due date
    // if (filters.fromDate || filters.toDate) {
    //     const fromDate = filters.fromDate ? new Date(filters.fromDate) : new Date('2000-01-01');
    //     const toDate = filters.toDate ? new Date(filters.toDate) : new Date('2100-12-31');

    //     filteredData = filteredData.filter(payment => {
    //         // Use paymentDate if available, otherwise use dueDate
    //         const dateToCheck = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.dueDate);
    //         return dateToCheck >= fromDate && dateToCheck <= toDate;
    //     });
    // }

    // // Filter by search query
    // if (filters.searchQuery || filters.search || filters.taskId) {
    //     const query = (filters.searchQuery || filters.search || filters.taskId || '').toLowerCase();
    //     filteredData = filteredData.filter(payment =>
    //         payment.invoiceNumber.toLowerCase().includes(query) ||
    //         payment.clientName.toLowerCase().includes(query) ||
    //         payment.projectName.toLowerCase().includes(query) ||
    //         payment.paymentId.toLowerCase().includes(query) ||
    //         (payment.description && payment.description.toLowerCase().includes(query))
    //     );
    // }

    // // Filter by amount range
    // if (filters.minAmount) {
    //     const minAmount = parseFloat(filters.minAmount);
    //     filteredData = filteredData.filter(payment => payment.amount >= minAmount);
    // }
    // if (filters.maxAmount) {
    //     const maxAmount = parseFloat(filters.maxAmount);
    //     filteredData = filteredData.filter(payment => payment.amount <= maxAmount);
    // }

    // // Filter by payment method
    // if (filters.paymentMethod && filters.paymentMethod !== '') {
    //     filteredData = filteredData.filter(payment =>
    //         payment.paymentMethod === filters.paymentMethod
    //     );
    // }

    return filteredData;
};

// Main API function - returns mock data for now
export const getPaymentReportApi = async (request = {}) => {
    try {
        // Use mock data for development
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

        // Apply filters to mock data
        const filteredData = filterMockData(mockPaymentData, request);

        // Pagination
        const page = request.page || 1;
        const limit = request.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            success: true,
            message: "Payment report fetched successfully",
            data: paginatedData,
            total: filteredData.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredData.length / limit),
        };

    } catch (error) {
        console.error('Error in getPaymentReportApi:', error);

        // Return error in consistent format
        return {
            success: false,
            message: error.message || 'Failed to fetch payment report',
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };
    }
};

// Real API implementation (commented out for now)
/*
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const getPaymentReportApi = async (request = {}) => {
    try {
        const response = await axios.get(`${BASE_URL}/payment/report`, {
            params: {
                ...request,
                page: request.page || 1,
                limit: request.limit || 10,
            },
            ...getConfig()
        });
        
        return response.data;
    } catch (error) {
        console.error('Error in getPaymentReportApi:', error);
        
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch payment report',
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };
    }
};
*/

// Export mock data for testing if needed
export const getMockPaymentData = () => mockPaymentData;

// Optional: Additional API functions
export const createPaymentApi = async (request) => {
    try {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));

        const newPayment = {
            ...request,
            paymentId: `PAY-${mockPaymentData.length + 1}`,
            invoiceNumber: `INV-2023-${(mockPaymentData.length + 1).toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'pending',
            pendingAmount: request.amount - (request.paidAmount || 0),
        };

        mockPaymentData.unshift(newPayment);

        return {
            success: true,
            message: "Payment created successfully",
            data: newPayment,
        };
    } catch (error) {
        console.error('Error in createPaymentApi:', error);
        throw error;
    }
};

export const updatePaymentApi = async (request, paymentId) => {
    try {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));

        const index = mockPaymentData.findIndex(payment => payment.paymentId === paymentId);
        if (index !== -1) {
            mockPaymentData[index] = { ...mockPaymentData[index], ...request };
            return {
                success: true,
                message: "Payment updated successfully",
                data: mockPaymentData[index],
            };
        }

        throw new Error('Payment not found');
    } catch (error) {
        console.error('Error in updatePaymentApi:', error);
        throw error;
    }
};