import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

type PaginationProps = {
    tableProps: any;
    sizePerPageList?: {
        text: string;
        value: number;
    }[];
    totalCount?: number;
    manualPagination?: boolean;
};

const Pagination = ({
    tableProps,
    sizePerPageList = [
        { text: '10', value: 10 },
        { text: '25', value: 25 },
        { text: '50', value: 50 },
        { text: '100', value: 100 },
    ],
    totalCount = 0,
    manualPagination = false,
}: PaginationProps) => {
    const pageCount = tableProps.pageCount;
    const pageIndex = tableProps.state.pageIndex;
    const activePage = pageIndex + 1;

    const getVisiblePages = useCallback((page: number, total: number) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        if (page <= 4) {
            return [1, 2, 3, 4, 5, '...', total];
        }

        if (page >= total - 3) {
            return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
        }

        return [1, '...', page - 1, page, page + 1, '...', total];
    }, []);

    const [visiblePages, setVisiblePages] = useState<(number | string)[]>([]);

    useEffect(() => {
        const pages = getVisiblePages(activePage, pageCount);
        setVisiblePages(pages);
    }, [activePage, pageCount, getVisiblePages]);

    const changePage = (page: number | string) => {
        if (typeof page !== 'number' || page === activePage) return;
        tableProps.gotoPage(page - 1);
    };

    const displayTotalCount = manualPagination ? totalCount : tableProps.rows.length;
    const dataLength = manualPagination ? totalCount : tableProps.rows.length;

    const sizeList = [...sizePerPageList, ...(manualPagination ? [] : [{ text: 'ALL', value: dataLength > 0 ? dataLength : 999999 }])];

    return (
        <div className="flex items-center justify-between gap-4 py-4 text-center flex-nowrap overflow-hidden">
            {sizeList.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap text-gray-700">Display:</label>
                    <select 
                        value={tableProps.state.pageSize} 
                        onChange={(e) => tableProps.setPageSize(Number(e.currentTarget.value))} 
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee7f1b] focus:border-transparent transition-all duration-200"
                    >
                        {sizeList.map((pageSize, index) => (
                            <option key={index} value={pageSize.value}>
                                {pageSize.text}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Desktop: Show full page info */}
            <div className="text-sm whitespace-nowrap hidden xl:block flex-shrink-0 text-gray-700">
                Page{' '}
                <strong className="text-gray-800">
                    {activePage} of {pageCount}
                </strong>{' '}
                | Total Records: <strong className="text-gray-800">{displayTotalCount}</strong>
            </div>

            {/* Mobile: Show condensed page info */}
            <div className="text-sm whitespace-nowrap xl:hidden flex-shrink-0 text-gray-700">
                <strong className="text-gray-800">
                    {activePage}/{pageCount}
                </strong>
            </div>

            <ul className="flex items-center gap-1 flex-nowrap flex-shrink-0 overflow-x-auto">
                {/* Previous Button */}
                <li
                    className={classNames(
                        'cursor-pointer px-4 py-2 border rounded-lg font-bold transition-all duration-200 flex-shrink-0', 
                        { 
                            'opacity-50 pointer-events-none bg-gray-100 border-gray-200': activePage === 1,
                            'border-gray-300 hover:bg-gray-50 hover:border-[#ee7f1b] hover:text-[#ee7f1b] active:scale-95': activePage !== 1
                        }
                    )}
                    onClick={() => activePage !== 1 && changePage(activePage - 1)}
                >
                    <Link to="#" className="flex items-center text-lg">
                        ←
                    </Link>
                </li>

                {/* Page Numbers */}
                {visiblePages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <li key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400 flex-shrink-0">
                                ...
                            </li>
                        );
                    }

                    return (
                        <li
                            key={page}
                            className={classNames(
                                'cursor-pointer px-4 py-2 border rounded-lg transition-all duration-200 flex-shrink-0', 
                                { 
                                    'bg-gradient-to-r from-[#ee7f1b] to-[#f39c4a] text-white border-transparent shadow-md hover:shadow-lg': activePage === page,
                                    'border-gray-300 hover:bg-gradient-to-r hover:from-[#ee7f1b]/10 hover:to-[#f39c4a]/10 hover:border-[#ee7f1b] hover:text-[#ee7f1b] active:scale-95': activePage !== page
                                }
                            )}
                            onClick={() => changePage(page as number)}
                        >
                            <Link to="#" className="whitespace-nowrap font-medium">{page}</Link>
                        </li>
                    );
                })}

                {/* Next Button */}
                <li
                    className={classNames(
                        'cursor-pointer px-4 py-2 border rounded-lg font-bold transition-all duration-200 flex-shrink-0', 
                        { 
                            'opacity-50 pointer-events-none bg-gray-100 border-gray-200': activePage === pageCount,
                            'border-gray-300 hover:bg-gray-50 hover:border-[#ee7f1b] hover:text-[#ee7f1b] active:scale-95': activePage !== pageCount
                        }
                    )}
                    onClick={() => activePage !== pageCount && changePage(activePage + 1)}
                >
                    <Link to="#" className="flex items-center text-lg">
                        →
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;