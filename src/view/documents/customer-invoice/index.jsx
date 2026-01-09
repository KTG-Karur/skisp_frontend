import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCompany, resetCompanyStatus } from '../../../redux/companySlice';
import { baseURL } from '../../../api/ApiConfig';
import moment from 'moment';

const Invoice = () => {
    const dispatch = useDispatch();
    const [companyInfo, setCompanyInfo] = useState({});
    const [invoiceData, setInvoiceData] = useState(null);

    const { getCompanySuccess, companyData } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
    }));

    const sampleInvoice = {
        billing_no: 'INV-2024-001',
        billing_date: '01-08-2024',
        customer_name: 'John Smith',
        customer_address: '123 Main Street, Tech City, TC 560001',
        customer_gst_no: '29ABCDE1234F1Z5',
        total_amount: 10000,
        tax_total_amount: 1800,
        grand_total_amount: 11800,
        discount: 500,
        status: 'PAID',
        paid_amount: 11800,
        balance_amount: 0,
        items: [
            {
                product_name: 'Internet Broadband Plan - Premium 100Mbps',
                qty: 1,
                unit_rate: 10000,
                tax: 1800,
                total: 11800
            },
            {
                product_name: 'Router Installation Charge',
                qty: 1,
                unit_rate: 0,
                tax: 0,
                total: 0
            }
        ],
        tax_breakdown: {
            cgst: { amount: 900, percentage: 9 },
            sgst: { amount: 900, percentage: 9 },
            igst: { amount: 0, percentage: 0 }
        }
    };

    useEffect(() => {
        dispatch(getCompany());
        setInvoiceData(sampleInvoice);
    }, [dispatch]);

    useEffect(() => {
        if (getCompanySuccess && companyData?.data?.[0]) {
            const companyDataItem = companyData.data[0];
            setCompanyInfo({
                companyName: companyDataItem?.companyName || 'SKISP',
                companyMobile: companyDataItem?.companyMobile || '+91 9876543210',
                companyMail: companyDataItem?.companyMail || 'info@skisp.com',
                companyAddress: companyDataItem?.companyAddressOne || '123 Tech Park, Bangalore',
                companyGstNo: companyDataItem?.companyGstNo || '29ABCDE1234F1Z5',
                logoPreview: companyDataItem?.companyLogo ? `${baseURL}${companyDataItem?.companyLogo}` : '',
            });
            dispatch(resetCompanyStatus());
        }
    }, [getCompanySuccess, companyData, dispatch]);

    const formatInvoiceDate = (dateString) => {
        if (!dateString) return '';
        const [month, day, year] = dateString.split('-');
        return `${day}-${getMonthName(month)}-${year}`.toUpperCase();
    };

    const getMonthName = (month) => {
        const months = [
            'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
        ];
        return months[parseInt(month) - 1] || 'JAN';
    };

    const numberToWords = (number) => {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        if (number === 0) return 'Zero Rupees Only';
        
        const crore = Math.floor(number / 10000000);
        number %= 10000000;
        const lakh = Math.floor(number / 100000);
        number %= 100000;
        const thousand = Math.floor(number / 1000);
        number %= 1000;
        const hundred = Math.floor(number / 100);
        const remainder = number % 100;
        
        let result = '';
        
        if (crore > 0) {
            result += `${convertTwoDigit(crore)} Crore `;
        }
        if (lakh > 0) {
            result += `${convertTwoDigit(lakh)} Lakh `;
        }
        if (thousand > 0) {
            result += `${convertTwoDigit(thousand)} Thousand `;
        }
        if (hundred > 0) {
            result += `${units[hundred]} Hundred `;
        }
        if (remainder > 0) {
            result += `${convertTwoDigit(remainder)} `;
        }
        
        return result.trim() + ' Rupees Only';
        
        function convertTwoDigit(num) {
            if (num < 10) return units[num];
            if (num < 20) return teens[num - 10];
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            return tens[ten] + (unit > 0 ? ' ' + units[unit] : '');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        window.history.back();
    };

    if (!invoiceData) {
        return <div className="flex justify-center items-center h-screen">Loading invoice...</div>;
    }

    const invoiceDate = moment(invoiceData.billing_date, 'MM-DD-YYYY');
    const validFrom = invoiceDate.format('01-MM-YYYY');
    const validTo = invoiceDate.endOf('month').format('DD-MM-YYYY');

    return (
        <div className="p-2 bg-gray-100 min-h-screen">
            <style jsx>{`
                @media print {
                    body, html {
                        margin: 2px !important;
                        padding: 2px !important;
                        background: white !important;
                        width: 100% !important;
                    }
                    
                    body * {
                        visibility: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .invoice-wrapper,
                    .invoice-wrapper * {
                        visibility: visible !important;
                    }
                    
                    .invoice-wrapper {
                        position: absolute !important;
                        left: 2px !important;
                        top: 2px !important;
                        width: calc(100% - 4px) !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    
                    .print-button,
                    .action-buttons {
                        display: none !important;
                    }
                    
                    @page {
                        size: A4;
                        margin: 5mm;
                    }
                }
            `}</style>

            {/* Action Buttons */}
            <div className="action-buttons mb-4 flex justify-center gap-4">
                <button 
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    ← Back
                </button>
                <button 
                    onClick={handlePrint}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                >
                    🖨️ Print Invoice
                </button>
            </div>

            {/* Invoice Wrapper */}
            <div className="invoice-wrapper bg-white mx-auto" style={{
                width: '900px',
                padding: '20px 25px',
                border: '1px solid #000',
                color: '#000',
                fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
                {/* Header */}
                <div className="header flex justify-between mb-3">
                    <div className="header-left">
                        {companyInfo.logoPreview ? (
                            <img 
                                src={companyInfo.logoPreview} 
                                crossOrigin='ananymous'
                                alt="Company Logo"
                                style={{
                                    width: '180px',
                                    height: '90px',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                        <div style="width:180px;height:90px;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px">
                                            ${companyInfo.companyName}
                                        </div>
                                    `;
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '180px',
                                height: '90px',
                                border: '1px solid #000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{companyInfo.companyName}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="company-details text-right">
                        <h2 style={{ fontSize: '16px', margin: '0', fontWeight: 'bold', color: '#000' }}>
                            {companyInfo.companyName}
                        </h2>
                        <p style={{ margin: '3px 0', fontSize: '12px', lineHeight: '16px', color: '#000' }}>
                            {companyInfo.companyAddress}<br />
                            Phone: {companyInfo.companyMobile}<br />
                            Email: {companyInfo.companyMail}<br />
                            GSTIN: {companyInfo.companyGstNo}
                        </p>
                    </div>
                </div>

                {/* Invoice Title */}
                <div className="section-title mb-3" style={{
                    fontWeight: 'bold',
                    fontSize: '22px',
                    color: '#000',
                    textAlign: 'center',
                    borderBottom: '2px solid #000',
                    paddingBottom: '6px'
                }}>
                    TAX INVOICE
                </div>

                {/* Customer and Invoice Details */}
                <div style={{ 
                    border: '1px solid #000', 
                    marginBottom: '15px',
                    fontSize: '12px'
                }}>
                    <table style={{ 
                        width: '100%', 
                        borderCollapse: 'collapse'
                    }}>
                        <tbody>
                            <tr>
                                <td style={{ 
                                    width: '50%', 
                                    verticalAlign: 'top', 
                                    borderRight: '1px solid #000',
                                    padding: '8px'
                                }}>
                                    <strong style={{ color: '#000', fontSize: '13px' }}>BILL TO:</strong><br />
                                    <strong style={{ color: '#000' }}>{invoiceData.customer_name}</strong><br />
                                    {invoiceData.customer_address}<br />
                                    {invoiceData.customer_gst_no && `GSTIN: ${invoiceData.customer_gst_no}`}
                                </td>
                                
                                <td style={{ 
                                    width: '50%', 
                                    verticalAlign: 'top', 
                                    padding: '8px'
                                }}>
                                    <p style={{ margin: '2px 0', color: '#000' }}>
                                        <strong style={{ color: '#000' }}>Invoice No:</strong> {invoiceData.billing_no}
                                    </p>
                                    <p style={{ margin: '2px 0', color: '#000' }}>
                                        <strong style={{ color: '#000' }}>Invoice Date:</strong> {formatInvoiceDate(invoiceData.billing_date)}
                                    </p>
                                    <p style={{ margin: '2px 0', color: '#000' }}>
                                        <strong style={{ color: '#000' }}>Invoice Period:</strong> {invoiceDate.format('MMM-YYYY').toUpperCase()}
                                    </p>
                                    <p style={{ margin: '2px 0', color: '#000' }}>
                                        <strong style={{ color: '#000' }}>Account Validity:</strong>
                                        {' {'}{validFrom} TO {validTo}{'}'}
                                    </p>
                                    <p style={{ margin: '2px 0', color: '#000' }}>
                                        <strong style={{ color: '#000' }}>Payment Method:</strong> Post Paid
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Items and Calculations Table */}
                <div style={{ 
                    border: '1px solid #000',
                    marginBottom: '12px'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '11px'
                    }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ 
                                    width: '5%', 
                                    padding: '4px 5px', 
                                    borderBottom: '1px solid #000',
                                    textAlign: 'center' 
                                }}>S.No</th>
                                <th style={{ 
                                    width: '50%', 
                                    padding: '4px 5px', 
                                    borderBottom: '1px solid #000'
                                }}>Description</th>
                                <th style={{ 
                                    width: '10%', 
                                    padding: '4px 5px', 
                                    borderBottom: '1px solid #000',
                                    textAlign: 'center' 
                                }}>Qty</th>
                                <th style={{ 
                                    width: '15%', 
                                    padding: '4px 5px', 
                                    borderBottom: '1px solid #000',
                                    textAlign: 'right' 
                                }}>Unit Price</th>
                                <th style={{ 
                                    width: '20%', 
                                    padding: '4px 5px', 
                                    borderBottom: '1px solid #000',
                                    textAlign: 'right' 
                                }}>Amount (₹)</th>
                            </tr>
                        </thead>
                        
                        <tbody>
                            {/* Item 1 */}
                            <tr>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'center',
                                    color: '#000'
                                }}>
                                    1
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    color: '#000'
                                }}>
                                    Internet Broadband Plan - Premium 100Mbps
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'center',
                                    color: '#000'
                                }}>
                                    1
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    10000.00
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    ₹ 11800.00
                                </td>
                            </tr>
                            
                            {/* Item 2 */}
                            <tr>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'center',
                                    color: '#000'
                                }}>
                                    2
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    color: '#000'
                                }}>
                                    Router Installation Charge
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'center',
                                    color: '#000'
                                }}>
                                    1
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    -
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    FREE
                                </td>
                            </tr>
                            
                            {/* Single compact empty row */}
                            <tr style={{ height: '4px' }}>
                                <td style={{ padding: '1px 5px' }}>&nbsp;</td>
                                <td style={{ padding: '1px 5px' }}>&nbsp;</td>
                                <td style={{ padding: '1px 5px' }}>&nbsp;</td>
                                <td style={{ padding: '1px 5px' }}>&nbsp;</td>
                                <td style={{ padding: '1px 5px' }}>&nbsp;</td>
                            </tr>
                            
                            {/* Sub Total */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    Sub Total
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    ₹ 10000.00
                                </td>
                            </tr>
                            
                            {/* Discount */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#008000',
                                    fontWeight: 'bold'
                                }}>
                                    Discount
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    - ₹ 500.00
                                </td>
                            </tr>
                            
                            {/* Taxable Amount */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    Taxable Amount
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    ₹ 9500.00
                                </td>
                            </tr>
                            
                            {/* CGST */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    CGST (9%)
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    ₹ 900.00
                                </td>
                            </tr>
                            
                            {/* SGST */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    SGST (9%)
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    ₹ 900.00
                                </td>
                            </tr>
                            
                            {/* IGST */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    IGST (0%)
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    color: '#000'
                                }}>
                                    ₹ 0.00
                                </td>
                            </tr>
                            
                            {/* Total GST */}
                            <tr>
                                <td colSpan="4" style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    color: '#000'
                                }}>
                                    Total GST
                                </td>
                                <td style={{ 
                                    padding: '2px 5px', 
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    color: '#000'
                                }}>
                                    ₹ 1800.00
                                </td>
                            </tr>
                            
                            {/* Grand Total - Directly after Total GST with minimal spacing */}
                            <tr style={{ background: '#f0f0f0' }}>
                                <td colSpan="4" style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    color: '#000'
                                }}>
                                    GRAND TOTAL
                                </td>
                                <td style={{ 
                                    padding: '3px 5px', 
                                    textAlign: 'right',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    color: '#000'
                                }}>
                                    ₹ 11800.00
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Payment Status and Amount in Words */}
                <div style={{ marginTop: '10px', fontSize: '11px' }}>
                    <div style={{ marginBottom: '6px' }}>
                        <strong style={{ color: '#000' }}>Payment Status:</strong> 
                        <span style={{ 
                            color: invoiceData.status === 'PAID' ? '#008000' : '#ff0000',
                            fontWeight: 'bold',
                            marginLeft: '8px'
                        }}>
                            {invoiceData.status} - ₹ {invoiceData.paid_amount.toFixed(2)} Paid
                        </span>
                    </div>
                    
                    <div style={{ fontWeight: 'bold', color: '#000' }}>
                        <strong>Amount in Words:</strong> Eleven Thousand Eight Hundred Rupees Only
                    </div>
                </div>

                {/* Footer */}
                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '20px',
                    fontSize: '11px',
                    color: '#000'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        This is an electronically generated invoice and does not require a signature.
                    </div>
                    <div>
                        © {new Date().getFullYear()} <strong>{companyInfo.companyName}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;