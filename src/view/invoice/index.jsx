import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { getPaymentInvoices, resetPaymentInvoicesStatus } from '../../redux/PaymentInvoicesSlice';
import { getCustomerDetails } from '../../redux/customerSlice';
import { getCompany } from '../../redux/companySlice'; // Import company API
import IconSearch from '../../components/Icon/IconSearch';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconFileText from '../../components/Icon/IconFile';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconClock from '../../components/Icon/IconClock';
import IconDownload from '../../components/Icon/IconDownload';
import IconEye from '../../components/Icon/IconEye';
import IconUser from '../../components/Icon/IconUser';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconFilter from '../../components/Icon/IconFilter';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconPlus from '../../components/Icon/IconPlus';
import IconEdit from '../../components/Icon/IconEdit';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../util/AllFunction';
import { baseURL } from '../../api/ApiConfig';
import { useSearchParams } from 'react-router-dom';
import SkispLogo from '../../../public/assets/images/skisp-new-logo copy.png';

const Index = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const invoiceId = searchParams.get('invoiceId');
    const paymentInvoicesState = useSelector((state) => state.PaymentInvoicesSlice || {});
    const customerState = useSelector((state) => state.CustomerSlice || {});
    const companyState = useSelector((state) => state.CompanySlice || {}); // Get company state

    const {
        invoices = [],
        loading: invoicesLoading = false,
        error: invoicesError = null,
        getPaymentInvoicesSuccess = false,
        generateInvoiceSuccess = false,
        updateInvoiceStatusSuccess = false,
    } = paymentInvoicesState;

    const { customerDetails = null, loading: customerLoading = false } = customerState;
    const { companyData = null, loading: companyLoading = false } = companyState; // Get company data

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [viewInvoiceModal, setViewInvoiceModal] = useState(false);

    // Add this state for debugging
    const [rawData, setRawData] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Customer Invoices'));
        if (userId) {
            fetchInvoices();
            fetchCustomerDetails();
        }
        // Fetch company details
        dispatch(getCompany());
    }, [dispatch, userId]);

    useEffect(() => {
        if (generateInvoiceSuccess) {
            showMessage('success', 'Invoice generated successfully');
            fetchInvoices();
            dispatch(resetPaymentInvoicesStatus());
        }
        if (updateInvoiceStatusSuccess) {
            showMessage('success', 'Invoice status updated successfully');
            fetchInvoices();
            dispatch(resetPaymentInvoicesStatus());
        }
        if (invoicesError) {
            showMessage('error', invoicesError);
            dispatch(resetPaymentInvoicesStatus());
        }
    }, [generateInvoiceSuccess, updateInvoiceStatusSuccess, invoicesError]);

    const fetchInvoices = () => {
        if (userId) {
            dispatch(
                getPaymentInvoices({
                    userId,
                    invoiceId,
                }),
            )
                .then((response) => {
                    console.log('Invoice response:', response);
                })
                .catch((error) => {
                    console.error('Error fetching invoices:', error);
                });
        }
    };

    const fetchCustomerDetails = () => {
        if (userId) {
            dispatch(getCustomerDetails(userId));
        }
    };

    // Helper function to extract company details
    const getCompanyDetails = () => {
        if (!companyData || !companyData.data || !companyData.data[0]) {
            return {
                companyName: 'SRI KRISHNA INTERNET SERVICES PVT LTD',
                companyAddressOne: 'No 391/1 SESHA TOWER, VAIYAPURI NAGAR 1ST CROSS, KARUR-639002',
                companyAddressTwo: '',
                companyMobile: '04324-232233',
                companyGstNo: '33ABACS4497H1Z6',
                companyAltMobile: '9965699903',
                companyMail: 'info@skisp.in',
                website: 'www.skisp.in',
                companyLogo: '',
            };
        }

        const company = companyData.data[0];
        return {
            companyName: company.companyName || 'SRI KRISHNA INTERNET SERVICES PVT LTD',
            companyAddressOne: company.companyAddressOne || 'No 391/1 SESHA TOWER, VAIYAPURI NAGAR 1ST CROSS, KARUR-639002',
            companyAddressTwo: company.companyAddressTwo || '',
            companyMobile: company.companyMobile || '04324-232233',
            companyGstNo: company.companyGstNo || '33ABACS4497H1Z6',
            companyAltMobile: company.companyAltMobile || '9965699903',
            companyMail: company.companyMail || 'info@skisp.in',
            website: company.website || 'www.skisp.in',
            companyLogo: company.companyLogo ? `${baseURL}${company.companyLogo}` : '',
        };
    };

    // Helper function to extract invoice data from your API response structure
    const getInvoiceData = () => {
        console.log('Getting invoice data, invoices state:', invoices);

        // If invoices is already an array, use it directly
        if (Array.isArray(invoices)) {
            console.log('Invoices is already an array:', invoices.length);
            return invoices;
        }

        // If invoices has a data property that's an array
        if (invoices && invoices.data && Array.isArray(invoices.data)) {
            console.log('Found invoices.data array:', invoices.data.length);
            return invoices.data;
        }

        // If rawData exists from debugging
        if (rawData && rawData.data && Array.isArray(rawData.data)) {
            console.log('Using rawData.data array:', rawData.data.length);
            return rawData.data;
        }

        // If the structure is different (like your JSON response)
        if (invoices && invoices.error === false && Array.isArray(invoices.data)) {
            console.log('Using invoices.data from error structure:', invoices.data.length);
            return invoices.data;
        }

        // If invoices is an object with nested data array
        if (invoices && typeof invoices === 'object' && invoices.data) {
            console.log('Invoices object with data property');
            // Try to extract the array
            const data = invoices.data;
            if (Array.isArray(data)) {
                return data;
            }
        }

        console.log('No invoice data found, returning empty array');
        return [];
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setViewInvoiceModal(true);
    };

    useEffect(() => {
        if (invoiceId && getInvoiceData().length === 1) {
            handleViewInvoice(getInvoiceData()[0]);
        }
    }, [invoiceId, invoices]);

    const handleDownloadInvoice = async (invoiceId) => {
        try {
            showMessage('info', 'Download functionality will be implemented soon');
        } catch (error) {
            showMessage('error', error.message || 'Failed to download invoice');
        }
    };

    const handlePrintInvoice = (invoice) => {
        const company = getCompanyDetails();
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
    <html>
        <head>
            <title>Invoice ${invoice.invoice_id}</title>
            <style>
                @page {
                    size: A4;
                    margin: 10mm;
                }
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                body { 
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    font-size: 10pt;
                    color: #000;
                    line-height: 1.3;
                    width: 210mm;
                    height: 297mm;
                }
                .invoice-container {
                    width: 190mm;
                    margin: 0 auto;
                    padding: 8mm 10mm;
                    background: #fff;
                }
                
                /* Centered Header */
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 2px solid #2c3e50;
                }
                .logo {
                    height: 60px;
                    width: auto;
                    margin: 0 auto 5px auto;
                    display: block;
                }
                .company-content {
                    text-align: center;
                    margin-top: 5px;
                }
                .service-provided {
                    font-size: 9pt;
                    color: #666;
                    margin-bottom: 8px;
                    font-weight: normal;
                }
                .company-details {
                    text-align: center;
                    font-size: 9pt;
                    line-height: 1.2;
                }
                .company-name {
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 3px;
                }
                .company-address {
                    margin-bottom: 2px;
                }
                .gst-details {
                    font-weight: bold;
                    font-size: 8pt;
                    margin-top: 3px;
                }
                
                /* Invoice Title */
                .invoice-title-section {
                    text-align: center;
                    margin: 10px 0 15px;
                    padding: 5px;
                }
                .invoice-title {
                    font-size: 16pt;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                /* Compact Invoice Info */
                .invoice-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                    font-size: 9pt;
                }
                .info-card {
                    padding: 8px;
                    border: 1px solid #ddd;
                    background: #f9f9f9;
                }
                .info-card-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    padding-bottom: 3px;
                    border-bottom: 1px solid #ccc;
                    font-size: 9pt;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 3px;
                    font-size: 8.5pt;
                }
                .info-label {
                    font-weight: 600;
                    min-width: 70px;
                }
                .info-value {
                    flex: 1;
                }
                
                /* Compact Items Table */
                .items-section {
                    margin: 15px 0;
                }
                .items-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                    font-size: 10pt;
                    padding-bottom: 3px;
                    border-bottom: 1px solid #2c3e50;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8.5pt;
                }
                .items-table thead {
                    background: #ddd;
                    color: white;
                }
                .items-table th {
                    padding: 5px 4px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    border: 1px solid #dee2e6;
                }
                .items-table td {
                    padding: 5px 4px;
                    border: 1px solid #dee2e6;
                    vertical-align: top;
                }
                .item-description {
                    font-size: 8pt;
                    color: #666;
                    margin-top: 1px;
                }
                
                /* Compact Amount Summary */
                .amount-summary {
                    margin: 15px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    background: #f9f9f9;
                }
                .amount-rows {
                    width: 250px;
                    margin-left: auto;
                    font-size: 9pt;
                }
                .amount-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 4px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .amount-row.total {
                    border-bottom: 2px solid #2c3e50;
                    font-weight: bold;
                    padding-top: 6px;
                    margin-top: 3px;
                }
                
                /* Total in Words */
                .total-in-words {
                    padding: 8px;
                    border: 1px solid #ddd;
                    margin: 10px 0;
                    font-size: 9pt;
                }
                .total-label {
                    font-weight: bold;
                    margin-bottom: 3px;
                }
                
                /* Compact Terms */
                .terms-section {
                    margin: 15px 0;
                    padding: 10px;
                    border: 1px solid #ddd;
                    background: #f9f9f9;
                    font-size: 8pt;
                    line-height: 1.3;
                }
                .terms-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    font-size: 9pt;
                }
                .terms-content div {
                    margin-bottom: 3px;
                }
                
                /* Updated Footer - Centered Company Details */
                .footer {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #2c3e50;
                    font-size: 8pt;
                    text-align: center; /* Center everything in footer */
                }
                .footer-top {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 8px;
                    flex-direction: column; /* Stack items vertically */
                }
                .footer-service {
                    font-weight: normal;
                    margin-bottom: 5px;
                    font-size: 7.5pt;
                    color: #666;
                    text-align: left;      /* 👈 force left alignment */
                    width: 100%;           /* 👈 take full width */
                }
                .footer-center {
                    text-align: center;
                    margin: 5px 0;
                }
                .footer-company-name {
                    font-weight: bold;
                    margin-bottom: 3px;
                    font-size: 9pt;
                }
                .footer-address {
                    line-height: 1.2;
                    font-size: 8pt;
                }
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 5px;
                    border-top: 1px dashed #ccc;
                    margin-top: 8px;
                }
                .footer-generated {
                    font-style: italic;
                }
                .footer-eoe {
                    font-weight: bold;
                    font-style: italic;
                }
                
                /* Print Optimization */
                @media print {
                    @page {
                        margin: 10mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        width: 210mm;
                        height: 297mm;
                    }
                    .invoice-container {
                        padding: 5mm 8mm;
                        margin: 0;
                        width: 100%;
                        height: auto;
                        min-height: 277mm;
                    }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <!-- Centered Header -->
                <div class="header">
                    <div>
                        ${
                            company.companyLogo
                                ? `<img src="${company.companyLogo}" class="logo" alt="${company.companyName}" />`
                                : `<img src="${window.location.origin}/assets/images/skisp-new-logo copy.png" class="logo" alt="${company.companyName}" />`
                        }
                    </div>
                    <div class="company-header">
                        <div class="company-name">${company.companyName}</div>
                        <div class="company-address">${company.companyAddressOne}${company.companyAddressTwo ? ', ' + company.companyAddressTwo : ''}</div>
                        <div class="company-address">Ph: ${company.companyMobile} , GSTIN: ${company.companyGstNo}</div>
                        <div class="company-contact">
                            CUSTOMER CARE NO: ${company.companyAltMobile}, ${company.companyMail}, ${company.website}
                        </div>
                    </div>
                </div>
                
                <!-- Invoice Title -->
                <div class="invoice-title-section">
                    <div class="invoice-title">INVOICE / RECEIPT</div>
                </div>
                
                <!-- Invoice Information -->
                <div class="invoice-info-grid">
                    <!-- Customer Details -->
                    <div class="info-card">
                        <div class="info-card-title">CUSTOMER DETAILS</div>
                        <div class="info-row">
                            <div class="info-label">Customer ID:</div>
                            <div class="info-value">${userId}</div>
                        </div>
                        ${
                            customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value
                                ? `
                            <div class="info-row">
                                <div class="info-label">Name:</div>
                                <div class="info-value">${customerDetails.data.results.find((r) => r.fid === 'first_name').value} ${customerDetails.data.results.find((r) => r.fid === 'last_name')?.value || ''}</div>
                            </div>
                            `
                                : ''
                        }
                        ${
                            customerDetails?.data?.results?.find((r) => r.fid === 'user_mobile')?.value
                                ? `
                            <div class="info-row">
                                <div class="info-label">Mobile:</div>
                                <div class="info-value">${customerDetails.data.results.find((r) => r.fid === 'user_mobile').value}</div>
                            </div>
                            `
                                : ''
                        }
                    </div>
                    <!-- Invoice Details -->
                    <div class="info-card">
                        <div class="info-card-title">INVOICE DETAILS</div>
                        <div class="info-row">
                            <div class="info-label">Invoice No:</div>
                            <div class="info-value">${invoice.invoice_id}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Date:</div>
                            <div class="info-value">${new Date(invoice.bill_date).toLocaleDateString()}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Due Date:</div>
                            <div class="info-value">${new Date(invoice.due_date).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Invoice Items -->
                <div class="items-section">
                    <!-- <div class="items-title">INVOICE ITEMS</div> -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 5%;">Sl.No.</th>
                                <th style="width: 45%;">Description</th>
                                <th style="width: 15%;">HSN/SAC</th>
                                <th style="width: 10%;">Qty</th>
                                <th style="width: 25%; text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                invoice.items && invoice.items.length > 0
                                    ? invoice.items
                                          .map(
                                              (item, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>
                                                <div>${item.item_name || ''}</div>
                                                <div class="item-description">${item.item_description || ''}</div>
                                            </td>
                                            <td>${item.hsn_sac || '998422'}</td>
                                            <td>${item.quantity || 1}</td>
                                            <td style="text-align: right;">₹${parseFloat(item.amount || 0).toFixed(2)}</td>
                                        </tr>
                                    `,
                                          )
                                          .join('')
                                    : `<tr><td colspan="5" style="text-align: center;">No items</td></tr>`
                            }
                        </tbody>
                    </table>
                </div>
                
                <!-- Amount Summary -->
                <div class="amount-summary">
                    <div class="amount-rows">
                        ${
                            invoice.total_amount
                                ? `
                            <div class="amount-row">
                                <span>Sub Total:</span>
                                <span>₹${parseFloat(invoice.total_amount || 0).toFixed(2)}</span>
                            </div>
                        `
                                : ''
                        }
                        
                        ${
                            invoice.tax_amount > 0
                                ? `
                            <div class="amount-row">
                                <span>CGST @ 9%:</span>
                                <span>₹${(parseFloat(invoice.tax_amount || 0) / 2).toFixed(2)}</span>
                            </div>
                            <div class="amount-row">
                                <span>SGST @ 9%:</span>
                                <span>₹${(parseFloat(invoice.tax_amount || 0) / 2).toFixed(2)}</span>
                            </div>
                        `
                                : ''
                        }
                        
                        ${
                            invoice.discount_amount > 0
                                ? `
                            <div class="amount-row">
                                <span>Discount:</span>
                                <span>-₹${parseFloat(invoice.discount_amount || 0).toFixed(2)}</span>
                            </div>
                        `
                                : ''
                        }
                        
                        <div class="amount-row">
                            <span>Round Off:</span>
                            <span>₹${(parseFloat(invoice.payable_amount || 0) - Math.round(parseFloat(invoice.payable_amount || 0))).toFixed(2)}</span>
                        </div>
                        
                        <div class="amount-row total">
                            <span>TOTAL:</span>
                            <span>₹${parseFloat(invoice.payable_amount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Total in Words -->
                <div class="total-in-words">
                    <div class="total-label">Total in words:</div>
                    <div>Rupees ${numberToWords(parseFloat(invoice.payable_amount || 0))}</div>
                </div>
                
                <!-- Terms -->
                <div class="terms-section">
                    <div class="terms-title">TERMS & CONDITIONS</div>
                    <div class="terms-content">
                        <div>1. Amount to be paid by Online/Cheque/DD</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;SRI KRISHNA INTERNET SERVICE PRIVATE LIMITED</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;KVB BANK A/C: 1152135000012440</div>
                        <div>&nbsp;&nbsp;&nbsp;&nbsp;IFSC: KVBL0001152</div>
                        <div>2. Comply with applicable laws at all times.</div>
                        <div>3. User assumes responsibility for service use.</div>
                        <div style="margin-top: 5px;"><strong>DECLARATION:</strong> All particulars are true and correct.</div>
                    </div>
                </div>
                
                <!-- Updated Footer with centered company details -->
                <div class="footer">
                    <!-- Service provided (smaller font) -->
                    <div class="footer-service">Service provided by: SKISP BROADBAND</div>
                    
                    <!-- Centered Company details -->
                    <div class="footer-center">
                        <div class="footer-company-name">SRI KRISHNA INTERNET SERVICES PVT LTD</div>
                        <div class="footer-address">No 391/1 SESHA TOWER, VAIYAPURI NAGAR 1ST CROSS, KARUR-639002, Ph: 04324-232233</div>
                    </div>
                    
                    <!-- Bottom section -->
                    <div class="footer-bottom">
                        <div class="footer-generated">This is computer generated invoice.</div>
                        <div class="footer-eoe">E&OE</div>
                    </div>
                </div>
            </div>
            
            <script>
                // Auto print
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
    </html>
`);

        printWindow.document.close();
    };

    // Simple number to words function
    const numberToWords = (num) => {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertHundreds(n) {
            let word = '';
            if (n > 99) {
                word += units[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n > 19) {
                word += tens[Math.floor(n / 10)] + ' ';
                n %= 10;
            } else if (n > 9) {
                word += teens[n - 10] + ' ';
                n = 0;
            }
            if (n > 0) {
                word += units[n] + ' ';
            }
            return word.trim();
        }

        let rupees = Math.floor(num);
        let paise = Math.round((num - rupees) * 100);

        let words = '';

        if (rupees === 0) {
            words = 'Zero';
        } else {
            // Handle lakhs
            if (rupees >= 100000) {
                words += convertHundreds(Math.floor(rupees / 100000)) + ' Lakh ';
                rupees %= 100000;
            }

            // Handle thousands
            if (rupees >= 1000) {
                words += convertHundreds(Math.floor(rupees / 1000)) + ' Thousand ';
                rupees %= 1000;
            }

            // Handle hundreds
            words += convertHundreds(rupees);
        }

        words = words.trim() + ' Only';

        return words;
    };

    const handleGenerateInvoice = () => {
        showMessage('info', 'Invoice generation functionality will be implemented soon');
    };

    const getFilteredData = () => {
        const invoiceData = getInvoiceData();
        let filtered = invoiceData;

        console.log('Filtering data, total invoices:', invoiceData.length);

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter((invoice) => invoice.status === statusFilter);
        }

        // Apply date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
            switch (dateFilter) {
                case 'last30':
                    filtered = filtered.filter((invoice) => new Date(invoice.bill_date) >= thirtyDaysAgo);
                    break;
                case 'pending':
                    filtered = filtered.filter((invoice) => invoice.status === 'pending');
                    break;
                case 'paid':
                    filtered = filtered.filter((invoice) => invoice.status === 'paid');
                    break;
                default:
                    break;
            }
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((invoice) => {
                return (
                    invoice.invoice_id?.toLowerCase().includes(term) ||
                    (invoice.plan_id && invoice.plan_id.toLowerCase().includes(term)) ||
                    (invoice.billing_period && invoice.billing_period.toLowerCase().includes(term)) ||
                    invoice.status?.toLowerCase().includes(term) ||
                    invoice.total_amount?.toString().includes(term) ||
                    invoice.payable_amount?.toString().includes(term) ||
                    // Search in items
                    (invoice.items && invoice.items.some((item) => item.item_name?.toLowerCase().includes(term) || item.item_description?.toLowerCase().includes(term)))
                );
            });
        }

        console.log('Filtered invoices:', filtered.length);
        return filtered;
    };

    const getPaginatedData = () => {
        const dataArray = getFilteredData();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const columns = [
        {
            Header: 'Invoice ID',
            accessor: 'invoice_id',
            Cell: ({ value }) => <div className="font-mono text-sm text-blue-600">{value?.substring(0, 8)}...</div>,
        },
        {
            Header: 'Bill Date',
            accessor: 'bill_date',
            Cell: ({ value }) => {
                if (!value) return 'N/A';
                return (
                    <div className="flex items-center space-x-2">
                        <IconCalendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(value).toLocaleDateString()}</span>
                    </div>
                );
            },
        },
        {
            Header: 'Due Date',
            accessor: 'due_date',
            Cell: ({ value }) => {
                if (!value) return 'N/A';
                const dueDate = new Date(value);
                const today = new Date();
                const isOverdue = dueDate < today;
                return (
                    <div className={`flex items-center space-x-2 ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                        <IconCalendar className="w-4 h-4" />
                        <span>{dueDate.toLocaleDateString()}</span>
                        {isOverdue && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Overdue</span>}
                    </div>
                );
            },
        },
        {
            Header: 'Plan/Service',
            accessor: 'items',
            Cell: ({ value }) => {
                if (!value || !Array.isArray(value) || value.length === 0) return 'N/A';
                const item = value[0];
                return (
                    <div>
                        <div className="font-medium text-sm">{item.item_name}</div>
                        <div className="text-xs text-gray-500 truncate">{item.item_description}</div>
                    </div>
                );
            },
        },
        {
            Header: 'Amount',
            accessor: 'payable_amount',
            Cell: ({ value, row }) => {
                const invoice = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <IconDollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold">₹{value || '0.00'}</span>
                        </div>
                        {invoice.discount_amount > 0 && <div className="text-xs text-gray-500 line-through">₹{invoice.total_amount}</div>}
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => {
                const statusConfig = {
                    pending: { color: 'bg-yellow-100 text-yellow-800', icon: IconClock },
                    paid: { color: 'bg-green-100 text-green-800', icon: IconCheckCircle },
                    generated: { color: 'bg-blue-100 text-blue-800', icon: IconFileText },
                    cancelled: { color: 'bg-red-100 text-red-800', icon: IconXCircle },
                    success: { color: 'bg-green-100 text-green-800', icon: IconCheckCircle },
                };

                const config = statusConfig[value] || { color: 'bg-gray-100 text-gray-800', icon: IconFileText };
                const StatusIcon = config.icon;

                return (
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {value?.charAt(0).toUpperCase() + value?.slice(1)}
                    </div>
                );
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const invoice = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        {/* View Invoice */}
                        <Tippy content="View Invoice">
                            <button onClick={() => handleViewInvoice(invoice)} className="btn btn-sm btn-outline-info">
                                <IconEye className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {/* Print Invoice */}
                        <Tippy content="Print Invoice">
                            <button onClick={() => handlePrintInvoice(invoice)} className="btn btn-sm btn-outline-secondary">
                                <IconPrinter className="w-4 h-4" />
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 120,
        },
    ];

    // Calculate statistics
    const calculateStats = () => {
        const filtered = getFilteredData();
        const totalAmount = filtered.reduce((sum, inv) => sum + parseFloat(inv.payable_amount || 0), 0);
        const pendingAmount = filtered.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + parseFloat(inv.payable_amount || 0), 0);
        const paidAmount = filtered.filter((inv) => inv.status === 'paid' || inv.status === 'success').reduce((sum, inv) => sum + parseFloat(inv.payable_amount || 0), 0);
        const pendingCount = filtered.filter((inv) => inv.status === 'pending').length;
        const paidCount = filtered.filter((inv) => inv.status === 'paid' || inv.status === 'success').length;

        return {
            totalAmount: totalAmount.toFixed(2),
            pendingAmount: pendingAmount.toFixed(2),
            paidAmount: paidAmount.toFixed(2),
            totalCount: filtered.length,
            pendingCount,
            paidCount,
        };
    };

    const stats = calculateStats();

    // Debug: Log the data structure
    useEffect(() => {
        console.log('Current invoices state:', invoices);
        console.log('Extracted invoice data:', getInvoiceData());
        console.log('Customer details:', customerDetails);
        console.log('Company details:', companyData);
    }, [invoices, customerDetails, companyData]);

    return (
        <div>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-yellow-700">
                        Debug: User ID: {userId} | Invoices loaded: {getInvoiceData().length}
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                            <IconArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <IconUser className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value || ''} {customerDetails?.data?.results?.find((r) => r.fid === 'last_name')?.value || ''}
                                </h1>
                                <p className="text-gray-600">
                                    User ID: {userId} •<span className="ml-2">{customerDetails?.data?.results?.find((r) => r.fid === 'user_email')?.value || 'No email'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleGenerateInvoice} className="btn btn-success" disabled={invoicesLoading}>
                            <IconPlus className="w-4 h-4 mr-2" />
                            Generate Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Invoices</p>
                            <p className="text-2xl font-bold text-blue-800">{stats.totalCount}</p>
                            <p className="text-sm text-blue-700">₹{stats.totalAmount}</p>
                        </div>
                        <IconFileText className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Paid Invoices</p>
                            <p className="text-2xl font-bold text-green-800">{stats.paidCount}</p>
                            <p className="text-sm text-green-700">₹{stats.paidAmount}</p>
                        </div>
                        <IconCheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Pending Invoices</p>
                            <p className="text-2xl font-bold text-yellow-800">{stats.pendingCount}</p>
                            <p className="text-sm text-yellow-700">₹{stats.pendingAmount}</p>
                        </div>
                        <IconClock className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Balance Due</p>
                            <p className="text-2xl font-bold text-purple-800">₹{stats.pendingAmount}</p>
                            <p className="text-sm text-purple-700">{stats.pendingCount} invoices</p>
                        </div>
                        <IconDollarSign className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <IconSearch className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by invoice ID, plan, or amount..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-12 pr-4 py-3 w-full"
                            />
                        </div>
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="flex items-center space-x-2">
                                <IconFilter className="w-5 h-5 text-gray-400" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="generated">Generated</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="success">Success</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <IconCalendar className="w-5 h-5 text-gray-400" />
                                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="form-select">
                                    <option value="all">All Time</option>
                                    <option value="last30">Last 30 Days</option> <option value="pending">Pending Only</option>
                                    <option value="paid">Paid Only</option>
                                </select>
                            </div>
                            <button onClick={fetchInvoices} className="btn btn-secondary" disabled={invoicesLoading}>
                                <IconRefresh className={`w-5 h-5 ${invoicesLoading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="datatables">
                {invoicesLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading invoices...</p>
                    </div>
                ) : getInvoiceData().length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <IconFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Invoices Found</h3>
                        <p className="text-gray-500">No invoices available for this customer.</p>
                        <button onClick={fetchInvoices} className="mt-4 btn btn-primary">
                            <IconRefresh className="w-4 h-4 mr-2" />
                            Reload Invoices
                        </button>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={'Customer Invoices'}
                        data={getPaginatedData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={getFilteredData().length}
                        totalPages={Math.ceil(getFilteredData().length / pageSize)}
                        onPaginationChange={(pageIndex, newPageSize) => {
                            setCurrentPage(pageIndex);
                            setPageSize(newPageSize);
                        }}
                        pagination={true}
                        isSearchable={false}
                        isSortable={true}
                        loadings={invoicesLoading}
                    />
                )}
            </div>

            {/* Invoice Details Modal */}
            {viewInvoiceModal && selectedInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setViewInvoiceModal(false)}></div>

                        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <IconFileText className="w-8 h-8 text-white" />
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Invoice Details</h3>
                                            <p className="text-blue-100">ID: {selectedInvoice.invoice_id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewInvoiceModal(false)} className="text-white hover:text-blue-100">
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Invoice Header */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-700">Customer Information</h4>
                                            <p>
                                                <span className="font-medium">User ID:</span> {userId}
                                            </p>
                                            <p>
                                                <span className="font-medium">Name:</span> {customerDetails?.data?.results?.find((r) => r.fid === 'first_name')?.value || 'N/A'}{' '}
                                                {customerDetails?.data?.results?.find((r) => r.fid === 'last_name')?.value || ''}
                                            </p>
                                            <p>
                                                <span className="font-medium">Email:</span> {customerDetails?.data?.results?.find((r) => r.fid === 'user_email')?.value || 'N/A'}
                                            </p>
                                            <p>
                                                <span className="font-medium">Mobile:</span> {customerDetails?.data?.results?.find((r) => r.fid === 'user_mobile')?.value || 'N/A'}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-700">Invoice Information</h4>
                                            <p>
                                                <span className="font-medium">Invoice ID:</span> {selectedInvoice.invoice_id}
                                            </p>
                                            <p>
                                                <span className="font-medium">Bill Date:</span> {new Date(selectedInvoice.bill_date).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Due Date:</span> {new Date(selectedInvoice.due_date).toLocaleDateString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Status:</span>{' '}
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        selectedInvoice.status === 'paid' || selectedInvoice.status === 'success'
                                                            ? 'bg-green-100 text-green-800'
                                                            : selectedInvoice.status === 'pending'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : selectedInvoice.status === 'generated'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {selectedInvoice.status?.toUpperCase()}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-gray-700">Billing Details</h4>
                                            <p>
                                                <span className="font-medium">Created:</span> {new Date(selectedInvoice.created_at).toLocaleString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Updated:</span> {new Date(selectedInvoice.updated_at).toLocaleString()}
                                            </p>
                                            <p>
                                                <span className="font-medium">Recurring:</span> {selectedInvoice.is_recurring ? 'Yes' : 'No'}
                                            </p>
                                            {selectedInvoice.plan_id && (
                                                <p>
                                                    <span className="font-medium">Plan ID:</span> {selectedInvoice.plan_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amount Summary */}
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h4 className="font-semibold text-gray-700 mb-4">Amount Summary</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Total Amount</p>
                                                <p className="text-2xl font-bold text-gray-800">₹{selectedInvoice.total_amount || '0.00'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Tax Amount</p>
                                                <p className="text-xl font-semibold text-gray-700">₹{selectedInvoice.tax_amount || '0.00'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Discount</p>
                                                <p className="text-xl font-semibold text-green-600">₹{selectedInvoice.discount_amount || '0.00'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-500">Payable Amount</p>
                                                <p className="text-2xl font-bold text-blue-600">₹{selectedInvoice.payable_amount || '0.00'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Items */}
                                    {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-4">Invoice Items</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {selectedInvoice.items.map((item, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-sm">{item.item_name}</td>
                                                                <td className="px-4 py-2 text-sm">{item.item_description}</td>
                                                                <td className="px-4 py-2 text-sm">
                                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{item.item_type}</span>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm">{item.quantity || '1'}</td>
                                                                <td className="px-4 py-2 text-sm">₹{item.unit_price || '0.00'}</td>
                                                                <td className="px-4 py-2 text-sm font-medium">₹{item.amount || '0.00'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment History */}
                                    {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-4">Payment History</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gateway</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {selectedInvoice.payments.map((payment, index) => (
                                                            <tr key={index}>
                                                                <td className="px-4 py-2 text-sm font-mono">{payment.payment_id?.substring(0, 8)}...</td>
                                                                <td className="px-4 py-2 text-sm">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                                <td className="px-4 py-2 text-sm">{payment.payment_gateway}</td>
                                                                <td className="px-4 py-2 text-sm">₹{payment.amount || '0.00'}</td>
                                                                <td className="px-4 py-2 text-sm">
                                                                    <span
                                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                                            payment.status === 'success'
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : payment.status === 'failed'
                                                                                  ? 'bg-red-100 text-red-800'
                                                                                  : 'bg-yellow-100 text-yellow-800'
                                                                        }`}
                                                                    >
                                                                        {payment.status || 'Pending'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                                <button onClick={() => handlePrintInvoice(selectedInvoice)} className="btn btn-secondary">
                                    <IconPrinter className="w-4 h-4 mr-2" />
                                    Print
                                </button>
                                <button onClick={() => handleDownloadInvoice(selectedInvoice.invoice_id)} className="btn btn-primary">
                                    <IconDownload className="w-4 h-4 mr-2" />
                                    Download PDF
                                </button>
                                <button onClick={() => setViewInvoiceModal(false)} className="btn btn-outline-secondary">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;
