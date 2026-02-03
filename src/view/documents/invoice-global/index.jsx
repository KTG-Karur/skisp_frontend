import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const PublicInvoicePDF = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Static company information
    const companyInfo = {
        companyName: 'SRI KRISHNA INTERNET SERVICES PVT LTD',
        companyMobile: '04324-232233',
        companyAltMobile: '9965699903',
        companyMail: 'info@skisp.in',
        companyAddressOne: 'No 391/1 SESHA TOWER, VAIYAPURI NAGAR 1ST CROSS, KARUR-639002',
        companyAddressTwo: '',
        companyGstNo: '33ABACS4497H1Z6',
        website: 'www.skisp.in',
        companyLogo: '/assets/images/skisp-new-logo copy1.png',
        stateCode: 'Tamil Nadu (33)',
        stateName: 'Tamil Nadu'
    };

    useEffect(() => {
        if (invoiceId) {
            fetchInvoiceData();
        }
    }, [invoiceId]);

    const fetchInvoiceData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`http://localhost:5043/payments/invoices-tacitine?invoiceId=${invoiceId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success || data.error === false) {
                const tacktineData = data.data?.tacktine_data || data.tacktine_data;
                setInvoiceData(tacktineData);
                
                const customerRecord = tacktineData?.customerRecord || {};
                const customerPlanExpire = tacktineData?.customerPlanExpire || [];
                
                // Create customer details object
                const customerDetailsData = {
                    data: {
                        results: [
                            { fid: 'first_name', value: customerRecord.first_name || '' },
                            { fid: 'last_name', value: customerRecord.last_name || '' },
                            { fid: 'user_mobile', value: customerRecord.mobile || '' },
                            { fid: 'phone', value: customerRecord.phone || '' },
                            { fid: 'email', value: customerRecord.email || '' },
                            { fid: 'gstin', value: customerRecord.gstin_no || '' },
                            { fid: 'address', value: customerRecord.address || '' },
                            { fid: 'user_id', value: customerRecord.user_id || '' }
                        ]
                    }
                };
                
                setCustomerDetails(customerDetailsData);
                setUserId(customerRecord.user_id || '');
                
            } else {
                throw new Error(data.message || 'Failed to load invoice');
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            setError(error.message || 'Failed to load invoice data. Please check the invoice ID.');
            // Navigate to error page after a short delay
            setTimeout(() => {
                navigate('/pages/error503');
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    // Format invoice data
    const formatInvoiceData = () => {
        if (!invoiceData?.recent_invoice) {
            // Navigate to error if no invoice data
            setTimeout(() => {
                navigate('/pages/error503');
            }, 100);
            return null;
        }
        
        const invoice = invoiceData.recent_invoice;
        
        // Calculate amounts
        const totalAmount = parseFloat(invoice.total);
        const baseAmount = parseFloat(invoice.amount);
        const taxAmount = totalAmount - baseAmount;
        const discountAmount = 0;
        
        // Create items array with the specified description
        const items = [{
            item_name: 'Broadband usage charges',
            item_description: 'Validity Extension (31 Days)',
            hsn_sac: '998422',
            quantity: 1,
            amount: baseAmount
        }];
        
        // Calculate payable amount with round off
        const rawPayable = totalAmount;
        const roundedPayable = Math.round(rawPayable);
        const roundOff = (roundedPayable - rawPayable).toFixed(2);
        
        // Generate invoice number format if not available
        const invoiceNumber = invoice.invoice_num || `SKISP/1/ADP/0126/${invoiceId || '403'}`;
        
        // Get invoice date or use current date
        const invoiceDate = invoice.invoice_date || new Date().toISOString();
        
        // Calculate account validity (add 31 days to invoice date)
        const invoiceDateObj = new Date(invoiceDate);
        const accountValidityDate = new Date(invoiceDateObj);
        accountValidityDate.setDate(invoiceDateObj.getDate() + 31);
        
        return {
            invoice_id: invoiceNumber,
            invoice_date: invoiceDate,
            account_validity: accountValidityDate.toISOString(),
            bill_date: invoiceDate,
            due_date: invoice.due_date || invoiceDate,
            total_amount: baseAmount,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            payable_amount: roundedPayable,
            round_off: parseFloat(roundOff),
            items: items,
            payment_method: invoice.payment_method || 'Advance Paid',
            account_reference: invoice.account_reference || ''
        };
    };

    // Helper function to get customer field value
    const getCustomerField = (fid) => {
        if (!customerDetails?.data?.results) return '';
        const field = customerDetails.data.results.find(r => r.fid === fid);
        return field?.value || '';
    };

    // Number to words function
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

    // Format date to DD-MMM-YYYY
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return moment(dateString).format('DD-MMM-YYYY');
        } catch (error) {
            return '';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                backgroundColor: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        animation: 'spin 1s linear infinite',
                        borderRadius: '50%',
                        height: '48px',
                        width: '48px',
                        borderBottom: '2px solid #2563eb',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '16px', color: '#4b5563' }}>Loading invoice...</p>
                </div>
            </div>
        );
    }

    const invoice = formatInvoiceData();

    return (
        <div style={{ 
            padding: '16px',
            backgroundColor: 'white',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div
                className="invoice-container"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    height: 'auto',
                    margin: '0 auto',
                    backgroundColor: 'white'
                }}
            >
                <div className="invoice-container">
                    {/* Centered Header with spacing */}
                    <div className="header">
                        <div className="logo-container">
                            {companyInfo.companyLogo ? (
                                <img 
                                    src={companyInfo.companyLogo} 
                                    className="logo" 
                                    alt={companyInfo.companyName}
                                    style={{ marginBottom: "25px" }}
                                    onError={(e) => {
                                        e.target.src = '/assets/images/skisp-new-logo copy.png';
                                    }}
                                />
                            ) : (
                                <img 
                                    src="/assets/images/skisp-new-logo copy.png" 
                                    className="logo" 
                                    alt={companyInfo.companyName}
                                    style={{ marginBottom: "25px" }}
                                />
                            )}
                        </div>
                        <div className="company-header">
                            <div className="company-name-large">{companyInfo.companyName}</div>
                            <div className="company-address-small">
                                {companyInfo.companyAddressOne}
                            </div>
                            <div className="company-contact-small">
                                Ph: {companyInfo.companyMobile} , GSTIN: {companyInfo.companyGstNo}
                            </div>
                            <div className="company-contact-small">
                                CUSTOMER CARE NO: {companyInfo.companyAltMobile}, {companyInfo.companyMail}, {companyInfo.website}
                            </div>
                        </div>
                    </div>
                    
                    {/* Invoice Title */}
                    <div className="invoice-title-section">
                        <div className="invoice-title">INVOICE / RECEIPT</div>
                    </div>
                    
                    {/* Invoice Information - NO SPACE BETWEEN SECTIONS */}
                    <div className="invoice-info-grid-no-space">
                        {/* Customer Details */}
                        <div className="info-card-no-space">
                            {/* <div className="info-card-title">CUSTOMER DETAILS</div> */}
                            
                            <div className="info-row">
                                <div className="info-label">Name:</div>
                                <div className="info-value">
                                    {getCustomerField('first_name')} {getCustomerField('last_name')}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Address:</div>
                                <div className="info-value">
                                    {getCustomerField('address')}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Mobile:</div>
                                <div className="info-value">
                                    {getCustomerField('user_mobile')}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Phone:</div>
                                <div className="info-value">
                                    {getCustomerField('phone')}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Email:</div>
                                <div className="info-value">
                                    {getCustomerField('email') || 'info@skisp.in'}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">GSTIN:</div>
                                <div className="info-value">
                                    {getCustomerField('gstin')}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">State Code:</div>
                                <div className="info-value">
                                    {companyInfo.stateCode}
                                </div>
                            </div>
                        </div>
                        
                        {/* Invoice Details */}
                        <div className="info-card-no-space">
                            {/* <div className="info-card-title">INVOICE DETAILS</div> */}
                            <div className="info-row">
                                <div className="info-label">Invoice No:</div>
                                <div className="info-value">{invoice?.invoice_id}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Invoice Date:</div>
                                <div className="info-value">{formatDate(invoice?.invoice_date)}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Account Reference:</div>
                                <div className="info-value">{invoice?.account_reference}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Account Validity:</div>
                                <div className="info-value">{formatDate(invoice?.account_validity)}</div>
                            </div>
                            <div className="info-row">
                                <div className="info-label">Payment Method:</div>
                                <div className="info-value">{invoice?.payment_method}</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Invoice Items - NO SPACE AFTER */}
                    <div className="items-section-no-space">
                        <table className="items-table-compact">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>Sl.No.</th>
                                    <th style={{ width: '45%' }}>Description</th>
                                    <th style={{ width: '15%' }}>HSN/SAC</th>
                                    <th style={{ width: '10%' }}>Qty</th>
                                    <th style={{ width: '25%', textAlign: 'right' }}>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice?.items && invoice.items.length > 0 ? (
                                    invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: 'bold', fontSize: '8.5pt' }}>{item.item_name || ''}:</div>
                                                <div className="item-description-tiny">
                                                    <span style={{ fontWeight: 'bold' }}>Description:</span> {item.item_description || ''}
                                                </div>
                                            </td>
                                            <td>{item.hsn_sac || '998422'}</td>
                                            <td>{item.quantity || 1}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                ₹{parseFloat(item.amount || 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>
                                            No items
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Amount Summary - NO SPACE BEFORE/AFTER */}
                    <div className="amount-summary-no-space">
                        <div className="amount-rows">
                            {invoice?.tax_amount > 0 && (
                                <>
                                    <div className="amount-row-tight">
                                        <span>CGST @ 9.00%:</span>
                                        <span>₹{(parseFloat(invoice?.tax_amount || 0) / 2).toFixed(2)}</span>
                                    </div>
                                    <div className="amount-row-tight">
                                        <span>SGST @ 9.00%:</span>
                                        <span>₹{(parseFloat(invoice?.tax_amount || 0) / 2).toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            
                            {invoice?.total_amount && (
                                <div className="amount-row-tight">
                                    <span>Sub Total:</span>
                                    <span>₹{(parseFloat(invoice?.total_amount || 0) + parseFloat(invoice?.tax_amount || 0)).toFixed(2)}</span>
                                </div>
                            )}
                            
                            {invoice?.round_off !== 0 && (
                                <div className="amount-row-tight">
                                    <span>Round Off:</span>
                                    <span>
                                        ₹{parseFloat(invoice?.round_off || 0).toFixed(2)}
                                    </span>
                                </div>
                            )}
                            
                            <div className="amount-row-tight total">
                                <span>TOTAL:</span>
                                <span>₹{parseFloat(invoice?.payable_amount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Total in Words - NO SPACE BEFORE */}
                    <div className="total-in-words-no-space">
                        <div className="total-label">Total in words:</div>
                        <div>Rupees {numberToWords(parseFloat(invoice?.payable_amount || 0))}</div>
                    </div>
                    
                    {/* Terms & Conditions - NO SPACE BEFORE */}
                    <div className="terms-section-no-space">
                        <div className="terms-title">TERMS & CONDITIONS:</div>
                        <div className="terms-content">
                            <div>1. Amount to be paid by Online(OR)Cheque / DD</div>
                            <div>&nbsp;&nbsp;&nbsp;&nbsp;SRI KRISHNA INTERNET SERVICE PRIVATE LIMITED</div>
                            <div>&nbsp;&nbsp;&nbsp;&nbsp;KVB BANK (Current account)</div>
                            <div>&nbsp;&nbsp;&nbsp;&nbsp;A/C : 1152135000012440</div>
                            <div>&nbsp;&nbsp;&nbsp;&nbsp;KVB Ins branch</div>
                            <div>&nbsp;&nbsp;&nbsp;&nbsp;KVBL0001152 (used for RTGS and NEFT)</div>
                            <div>2. While using the Service you must comply with applicable laws at all times.</div>
                            <div>3. You assume total responsibility and risk for your and your authorized users' use of the Service.</div>
                            <div style={{ marginTop: '3px' }}>
                                <strong>Declaration:</strong> We declare that this invoice shows the actual price of the subscription and that all particulars are true and correct.
                            </div>
                        </div>
                    </div>
                    
                    {/* Updated Footer with centered company details - Keep as is */}
                    <div className="footer">
                        {/* Service provided (smaller font) */}
                        <div className="footer-service">Service provided by: SKISP BROADBAND</div>
                        
                        {/* Centered Company details */}
                        <div className="footer-center">
                            <div className="footer-company-name">SRI KRISHNA INTERNET SERVICES PVT LTD</div>
                            <div className="footer-address">
                                No 391/1 SESHA TOWER, VAIYAPURI NAGAR 1ST CROSS, KARUR-639002, Ph: 04324-232233
                            </div>
                        </div>
                        
                        {/* Bottom section */}
                        <div className="footer-bottom">
                            <div className="footer-generated">This is computer generated invoice.</div>
                            <div className="footer-eoe">E&OE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-print-none" style={{ 
                marginTop: '24px', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '16px',
                fontFamily: 'Arial, sans-serif'
            }}>
                <button 
                    onClick={() => window.history.back()}
                    style={{
                        padding: '8px 24px',
                        backgroundColor: '#4b5563',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        fontFamily: 'Arial, sans-serif'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
                >
                    ← Go Back
                </button>
                <button 
                    onClick={handlePrint}
                    style={{
                        padding: '8px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        fontFamily: 'Arial, sans-serif'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                    🖨️ Print Invoice
                </button>
            </div>

            {/* Add the same CSS styles with white background only */}
            <style jsx>{`
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
                    font-family: Arial, sans-serif !important;
                    margin: 0;
                    padding: 0;
                    font-size: 10pt;
                    color: #000;
                    line-height: 1.3;
                    width: 210mm;
                    height: 297mm;
                    background-color: white !important;
                }
                .invoice-container {
                    width: 190mm;
                    margin: 0 auto;
                    padding: 5mm 10mm;
                    background-color: white;
                    font-family: Arial, sans-serif !important;
                }
                
                /* Centered Header with increased logo and spacing */
                .header {
                    text-align: center;
                    margin-bottom: 8px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #2c3e50;
                    font-family: Arial, sans-serif !important;
                }
                .logo-container {
                    margin-bottom: 8px;
                }
                .logo {
                    height: 113px; /* Increased by 1.5x from 75px */
                    width: auto;
                    margin: 0 auto;
                    display: block;
                }
                .company-name-large {
                    font-family: Arial, sans-serif !important;
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 3px;
                }
                .company-address-small {
                    font-family: Arial, sans-serif !important;
                    font-size: 8pt;
                    line-height: 1.1;
                    margin-bottom: 2px;
                }
                .company-contact-small {
                    font-family: Arial, sans-serif !important;
                    font-size: 7.5pt;
                    line-height: 1.1;
                    margin-bottom: 2px;
                }
                
                /* Invoice Title */
                .invoice-title-section {
                    text-align: center;
                    margin: 5px 0 8px;
                    padding: 2px;
                    font-family: Arial, sans-serif !important;
                }
                .invoice-title {
                    font-family: Arial, sans-serif !important;
                    font-size: 14pt;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                /* Compact Invoice Info - NO SPACE BETWEEN */
                .invoice-info-grid-no-space {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                    margin-bottom: 8px;
                    font-size: 8pt;
                    font-family: Arial, sans-serif !important;
                }
                .info-card-no-space {
                    padding: 4px;
                    border: 1px solid #ddd;
                    background-color: white;
                    font-family: Arial, sans-serif !important;
                }
                .info-card-title {
                    font-family: Arial, sans-serif !important;
                    font-weight: bold;
                    margin-bottom: 2px;
                    padding-bottom: 1px;
                    border-bottom: 1px solid #ccc;
                    font-size: 8.5pt;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 1px;
                    font-size: 7.5pt;
                    font-family: Arial, sans-serif !important;
                }
                .info-label {
                    font-family: Arial, sans-serif !important;
                    font-weight: 600;
                    min-width: 80px;
                }
                .info-value {
                    flex: 1;
                    font-family: Arial, sans-serif !important;
                }
                
                /* Items Table - COMPACT with reduced inner spacing */
                .items-section-no-space {
                    margin: 0;
                    font-family: Arial, sans-serif !important;
                }
                .items-table-compact {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8.5pt;
                    margin: 0;
                    font-family: Arial, sans-serif !important;
                }
                .items-table-compact thead {
                    background-color: white;
                    font-family: Arial, sans-serif !important;
                }
                .items-table-compact th {
                    font-family: Arial, sans-serif !important;
                    padding: 3px 3px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    border: 1px solid #ddd;
                    background-color: white;
                    height: 20px;
                }
                .items-table-compact td {
                    font-family: Arial, sans-serif !important;
                    padding: 3px 3px;
                    border: 1px solid #ddd;
                    vertical-align: top;
                    background-color: white;
                    line-height: 1.1;
                    height: 28px;
                }
                .item-description-tiny {
                    font-family: Arial, sans-serif !important;
                    font-size: 7.5pt;
                    color: #666;
                    margin-top: 0px;
                }
                
                /* Amount Summary - NO SPACE BEFORE/AFTER */
                .amount-summary-no-space {
                    margin: 0;
                    padding: 4px;
                    border: 1px solid #ddd;
                    background-color: white;
                    font-family: Arial, sans-serif !important;
                }
                .amount-rows {
                    width: 250px;
                    margin-left: auto;
                    font-size: 8.5pt;
                    font-family: Arial, sans-serif !important;
                }
                .amount-row-tight {
                    font-family: Arial, sans-serif !important;
                    display: flex;
                    justify-content: space-between;
                    padding: 1px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .amount-row-tight.total {
                    font-family: Arial, sans-serif !important;
                    border-bottom: 2px solid #2c3e50;
                    font-weight: bold;
                    padding-top: 2px;
                    margin-top: 1px;
                }
                
                /* Total in Words - NO SPACE BEFORE */
                .total-in-words-no-space {
                    font-family: Arial, sans-serif !important;
                    padding: 4px;
                    border: 1px solid #ddd;
                    margin: 0;
                    font-size: 8.5pt;
                    background-color: white;
                    line-height: 1.2;
                }
                .total-label {
                    font-family: Arial, sans-serif !important;
                    font-weight: bold;
                    margin-bottom: 1px;
                }
                
                /* Terms & Conditions - NO SPACE BEFORE */
                .terms-section-no-space {
                    font-family: Arial, sans-serif !important;
                    margin: 0;
                    padding: 4px;
                    border: 1px solid #ddd;
                    background-color: white;
                    font-size: 7.5pt;
                    line-height: 1.1;
                }
                .terms-title {
                    font-family: Arial, sans-serif !important;
                    font-weight: bold;
                    margin-bottom: 2px;
                    font-size: 8pt;
                }
                .terms-content div {
                    font-family: Arial, sans-serif !important;
                    margin-bottom: 1px;
                }
                
                /* Updated Footer - Centered Company Details - Keep as is */
                .footer {
                    font-family: Arial, sans-serif !important;
                    margin-top: 8px;
                    padding-top: 6px;
                    border-top: 1px solid #2c3e50;
                    font-size: 8pt;
                    text-align: center;
                    background-color: white;
                }
                .footer-service {
                    font-family: Arial, sans-serif !important;
                    font-weight: normal;
                    margin-bottom: 2px;
                    font-size: 7.5pt;
                    color: #666;
                    text-align: left;
                    width: 100%;
                }
                .footer-center {
                    font-family: Arial, sans-serif !important;
                    text-align: center;
                    margin: 2px 0;
                }
                .footer-company-name {
                    font-family: Arial, sans-serif !important;
                    font-weight: bold;
                    margin-bottom: 1px;
                    font-size: 9pt;
                }
                .footer-address {
                    font-family: Arial, sans-serif !important;
                    line-height: 1.2;
                    font-size: 8pt;
                }
                .footer-bottom {
                    font-family: Arial, sans-serif !important;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 2px;
                    border-top: 1px dashed #ccc;
                    margin-top: 4px;
                }
                .footer-generated {
                    font-family: Arial, sans-serif !important;
                    font-style: italic;
                }
                .footer-eoe {
                    font-family: Arial, sans-serif !important;
                    font-weight: bold;
                    font-style: italic;
                }
                
                /* Print Optimization */
                @media print {
                    @page {
                        margin: 10mm;
                    }
                    body {
                        font-family: Arial, sans-serif !important;
                        margin: 0;
                        padding: 0;
                        width: 210mm;
                        height: 297mm;
                        background-color: white !important;
                    }
                    .invoice-container {
                        font-family: Arial, sans-serif !important;
                        padding: 5mm 8mm;
                        margin: 0;
                        width: 100%;
                        height: auto;
                        min-height: 277mm;
                        background-color: white;
                    }
                    .d-print-none {
                        display: none !important;
                    }
                    
                    /* Remove all background colors for print */
                    .info-card-no-space,
                    .amount-summary-no-space,
                    .total-in-words-no-space,
                    .terms-section-no-space,
                    .footer,
                    .items-table-compact thead,
                    .items-table-compact th,
                    .items-table-compact td {
                        background-color: white !important;
                    }
                    
                    /* Ensure borders are visible */
                    .info-card-no-space,
                    .amount-summary-no-space,
                    .total-in-words-no-space,
                    .terms-section-no-space {
                        border: 1px solid #ddd;
                    }
                    
                    .items-table-compact th,
                    .items-table-compact td {
                        border: 1px solid #ddd;
                    }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PublicInvoicePDF;