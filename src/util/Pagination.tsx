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
        <div className="flex items-center justify-between gap-4 py-2 text-center flex-nowrap overflow-hidden">
            {sizeList.length > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-sm font-medium whitespace-nowrap">Display:</label>
                    <select value={tableProps.state.pageSize} onChange={(e) => tableProps.setPageSize(Number(e.currentTarget.value))} className="border rounded px-2 py-1 text-sm">
                        {sizeList.map((pageSize, index) => (
                            <option key={index} value={pageSize.value}>
                                {pageSize.text}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Desktop: Show full page info */}
            <div className="text-sm whitespace-nowrap hidden xl:block flex-shrink-0">
                Page{' '}
                <strong>
                    {activePage} of {pageCount}
                </strong>{' '}
                | Total Records: <strong>{displayTotalCount}</strong>
            </div>

            {/* Mobile: Show condensed page info */}
            <div className="text-sm whitespace-nowrap xl:hidden flex-shrink-0">
                <strong>
                    {activePage}/{pageCount}
                </strong>
            </div>

            <ul className="flex items-center gap-1 flex-nowrap flex-shrink-0 overflow-x-auto">
                <li
                    className={classNames('cursor-pointer px-3 py-1 border rounded font-bold transition-colors flex-shrink-0', { 
                        'opacity-50 pointer-events-none': activePage === 1,
                        'hover:bg-gray-100': activePage !== 1
                    })}
                    onClick={() => activePage !== 1 && changePage(activePage - 1)}
                >
                    <Link to="#" className="flex items-center">
                        -
                    </Link>
                </li>

                {/* Page Numbers */}
                {visiblePages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <li key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400 flex-shrink-0">
                                ...
                            </li>
                        );
                    }

                    return (
                        <li
                            key={page}
                            className={classNames('cursor-pointer px-3 py-1 border rounded transition-colors flex-shrink-0', { 
                                'bg-blue-500 text-white': activePage === page,
                                'hover:bg-gray-100': activePage !== page
                            })}
                            onClick={() => changePage(page as number)}
                        >
                            <Link to="#" className="whitespace-nowrap">{page}</Link>
                        </li>
                    );
                })}

                {/* Next Button with "+" */}
                <li
                    className={classNames('cursor-pointer px-3 py-1 border rounded font-bold transition-colors flex-shrink-0', { 
                        'opacity-50 pointer-events-none': activePage === pageCount,
                        'hover:bg-gray-100': activePage !== pageCount
                    })}
                    onClick={() => activePage !== pageCount && changePage(activePage + 1)}
                >
                    <Link to="#" className="flex items-center">
                        +
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Pagination;