import { useRef, useEffect, forwardRef, useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination, useRowSelect, useGlobalFilter, useAsyncDebounce, useExpanded } from 'react-table';
import classNames from 'classnames';
import IconSearch from '../components/Icon/IconSearch';
import Pagination from './Pagination';
import IconUserPlus from '../components/Icon/IconUserPlus';
import FormLayout from './formLayout';

// Search Box (Global Filter)
const GlobalFilter = ({ preGlobalFilteredRows, globalFilter, setGlobalFilter, searchBoxClass, onSearch }) => {
    const count = preGlobalFilteredRows.length;
    const [value, setValue] = useState(globalFilter);
    const onChange = useAsyncDebounce((value) => {
        setGlobalFilter(value || undefined);
        if (onSearch) {
            onSearch(value || '');
        }
    }, 500);

    return (
        <div className={classNames(searchBoxClass)}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Search..."
                    className="form-input  border border-gray-300 rounded-md focus:ring-primary focus:border-primary w-full"
                    value={value || ''}
                    onChange={(e) => {
                        setValue(e.target.value);
                        onChange(e.target.value);
                    }}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                    <IconSearch className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Checkbox Component
const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} className="form-checkbox rounded text-primary border-gray-300 focus:ring-primary" />;
});

// Main Table Component
const Table = ({ ...props }) => {
    const {
        filterFormContainer,
        optionListState,
        filterSubmitFunction,
        onChangeCallBack,
        setState,
        filterColNo,
        onClickCallBack,
        state,
        filterTbl = false,
        isSortable = true,
        pagination = true,
        isSearchable = true,
        isSelectable = false,
        footerTbl = false,
        isExpandable = false,
        columns,
        data,
        pageSize = 10,
        pageIndex = 0,
        totalCount = 0,
        totalPages = 0,
        onPaginationChange,
        onSearch,
        loading = false,
        Title,
        toggle,
        addBtn = true,
        tableIcon = '',
        btnName = 'Add',
        onClickPreview = false,
        CustomizationColumn,
        tableClass = '',
        theadClass = '',
        classStyle = '',
    } = props;

    // Memoize the data and columns to prevent unnecessary re-renders
    const memoizedData = useMemo(() => data, [data]);
    const memoizedColumns = useMemo(() => columns, [columns]);

    // Table instance with proper hook order and dependencies
    const dataTable = useTable(
        {
            columns: memoizedColumns,
            data: memoizedData,
            initialState: {
                pageIndex,
                pageSize,
            },
            manualPagination: true, // Enable manual pagination
            pageCount: totalPages, // Total pages from server
            autoResetPage: false,
            // Add manual filters and sorting if needed
            manualGlobalFilter: true,
            manualSortBy: true,
        },
        isSearchable && useGlobalFilter,
        isSortable && useSortBy,
        isExpandable && useExpanded,
        pagination && usePagination, // This was likely missing
        isSelectable && useRowSelect,
        (hooks) => {
            if (isSelectable) {
                hooks.visibleColumns.push((columns) => [
                    {
                        id: 'selection',
                        Header: ({ getToggleAllPageRowsSelectedProps }) => <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />,
                        Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
                    },
                    ...columns,
                ]);
            }

            if (isExpandable) {
                hooks.visibleColumns.push((columns) => [
                    {
                        id: 'expander',
                        Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => <span {...getToggleAllRowsExpandedProps()}>{isAllRowsExpanded ? '-' : '+'}</span>,
                        Cell: ({ row }) =>
                            row.canExpand ? (
                                <span {...row.getToggleRowExpandedProps()} className="cursor-pointer">
                                    {row.isExpanded ? '-' : '+'}
                                </span>
                            ) : null,
                    },
                    ...columns,
                ]);
            }
        }
    );

    // Handle page changes - FIXED
    useEffect(() => {
        if (onPaginationChange && (dataTable.state.pageIndex !== pageIndex || dataTable.state.pageSize !== pageSize)) {
            onPaginationChange(dataTable.state.pageIndex, dataTable.state.pageSize);
        }
    }, [dataTable.state.pageIndex, dataTable.state.pageSize, onPaginationChange, pageIndex, pageSize]);

    // Reset to first page when data changes significantly
    useEffect(() => {
        if (dataTable.state.pageIndex > 0 && totalPages > 0 && dataTable.state.pageIndex >= totalPages) {
            dataTable.gotoPage(0);
        }
    }, [totalPages, dataTable.state.pageIndex]);

    const rows = dataTable.page; // Use page instead of rows for paginated data

    return (
        <div className="w-full ">
            <div className="p-4 bg-white shadow rounded-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    {Title && <h2 className="text-xl font-semibold">{Title}</h2>}
                    <div className="flex gap-2 mt-2 md:mt-0">
                        {toggle && addBtn && (
                            <button type="button" className="btn btn-primary" onClick={toggle}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" /> {btnName}
                            </button>
                        )}
                        {isSearchable && (
                            <GlobalFilter
                                preGlobalFilteredRows={dataTable.preGlobalFilteredRows}
                                globalFilter={dataTable.state.globalFilter}
                                setGlobalFilter={dataTable.setGlobalFilter}
                                onSearch={onSearch}
                            />
                        )}

                        <div className="mt-3">
                            {filterTbl && (
                                <FormLayout
                                    dynamicForm={filterFormContainer}
                                    optionListState={optionListState}
                                    handleSubmit={filterSubmitFunction}
                                    onChangeCallBack={onChangeCallBack}
                                    setState={setState}
                                    state={state}
                                    noOfColumns={filterColNo}
                                    onClickCallBack={onClickCallBack}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <table {...dataTable.getTableProps()} className={`min-w-full text-sm text-left ${tableClass}`}>
                        <thead className={`sticky top-0 bg-gray-100  ${theadClass} `}>
                            {dataTable.headerGroups.map((headerGroup, i) => (
                                <tr {...headerGroup.getHeaderGroupProps()} className="border-b" key={i}>
                                    {headerGroup.headers.map((column, i) => (
                                        <th
                                            {...column.getHeaderProps(column.sort && column.getSortByToggleProps())}
                                            className={`px-4 py-2 whitespace-nowrap font-medium text-gray-700 ${column.sort ? 'cursor-pointer' : ''} ${
                                                column.isSortedDesc ? 'sorting_desc' : column.isSorted ? 'sorting_asc' : ''
                                            }`}
                                            key={i}
                                            onClick={CustomizationColumn ? () => CustomizationColumn(column) : undefined}
                                        >
                                            {column.render('Header')}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...dataTable.getTableBodyProps()}>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center text-gray-500 py-8">
                                        {loading ? 'Loading...' : 'No records found'}
                                    </td>
                                </tr>
                            ) : (
                                rows.map((row) => {
                                    dataTable.prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()} onClick={() => onClickPreview && onClickPreview(row)} className="border-b hover:bg-gray-50">
                                            {row.cells.map((cell) => (
                                                <td {...cell.getCellProps()} className={`${classStyle} px-4 py-2 whitespace-nowrap text-gray-800`}>
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {footerTbl && (
                            <tfoot className="sticky bottom-0 bg-gray-100">
                                <tr>
                                    {dataTable.footerGroups[0].headers.map((column) => (
                                        <td key={column.id} {...column.getFooterProps()} className="px-4 py-2">
                                            {column.render('Footer')}
                                        </td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {pagination && <Pagination tableProps={dataTable} totalCount={totalCount} manualPagination={true} />}
            </div>
        </div>
    );
};

export default Table;
