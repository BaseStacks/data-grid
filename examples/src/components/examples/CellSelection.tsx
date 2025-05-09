import { Column, DataGridProvider, useDataGrid, useDataGridState, DataGridContainer, DataGridCell, CellSelectionPlugin, DataGridHeader, DataGridHeaderGroup, DataGridRow, DataGridScrollArea, StayInViewPlugin, RowPinningPlugin, RowKey, DataGridRowContainer, ColumnPinningPlugin, usePlugin, LayoutPlugin } from '@basestacks/data-grid';
import { useMemo, useState } from 'react';
import { generateData } from '@/helpers/dataHelpers';
import { cn } from '@/utils/cn';

export function CellSelection() {
    const columns = useMemo((): Column[] => [
        { key: 'id', header: 'ID'},
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'age', header: 'Age' },
        { key: 'address', header: 'Address' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'actions', header: 'Actions' },
    ], []);

    const [data, setData] = useState(() => {
        return generateData({
            fields: [
                { name: 'id', type: 'uuid', required: true },
                { name: 'firstName', type: 'firstName', required: true },
                { name: 'lastName', type: 'lastName', required: true },
                { name: 'age', type: 'number', min: 18, max: 99, required: false },
                { name: 'address', type: 'address', required: false },
                { name: 'email', type: 'email', required: false },
                { name: 'phone', type: 'phone', required: false },
            ],
            count: 10
        });
    });

    const [pinnedLeftColumns] = useState<RowKey[]>(() => columns.slice(0, 2).map((col) => col.key as RowKey));
    const [pinnedRightColumns] = useState<RowKey[]>(() => columns.slice(-2).map((col) => col.key as RowKey));

    const [pinnedTopRows] = useState<RowKey[]>(() => data.slice(0, 2).map((row) => row.id as RowKey));
    const [pinnedBottomRows] = useState<RowKey[]>(() => data.slice(-2).map((row) => row.id as RowKey));

    const dataGrid = useDataGrid({
        data,
        columns,
        rowKey: 'id',
        onChange: setData
    });

    usePlugin(dataGrid, LayoutPlugin);
    usePlugin(dataGrid, CellSelectionPlugin);
    usePlugin(dataGrid, StayInViewPlugin);
    usePlugin(dataGrid, ColumnPinningPlugin, {
        pinnedLeftColumns,
        pinnedRightColumns
    });
    usePlugin(dataGrid, RowPinningPlugin, {
        pinnedTopRows,
        pinnedBottomRows
    });

    const headers = useDataGridState(dataGrid.state.headers);
    const rows = useDataGridState(dataGrid.state.rows);

    return (
        <DataGridProvider dataGrid={dataGrid}>
            <DataGridContainer className={clxs.table}>
                <DataGridHeaderGroup className={clxs.headerGroup}>
                    {headers.map((header, index) => (
                        <DataGridHeader key={index} header={header} className={cn(clxs.header, clxs.cellPinned)} />
                    ))}
                    <span className="absolute right-0 w-[-15px] h-full bg-white dark:bg-gray-950" />
                </DataGridHeaderGroup>
                <DataGridScrollArea className="h-[300px] overflow-auto">
                    <DataGridRowContainer className="relative">
                        {rows.map((row) => (
                            <DataGridRow key={row.id} row={row} className={cn(clxs.row, clxs.rowPinned)}>
                                {row.cells.map((cell) => (
                                    <DataGridCell key={cell.id} cell={cell} className={cn(clxs.cell, clxs.cellActive, clxs.cellSelected, clxs.cellPinned)}>
                                        <span className="overflow-hidden line-clamp-1 break-words">{cell.render()}</span>
                                    </DataGridCell>
                                ))}
                            </DataGridRow>
                        ))}
                    </DataGridRowContainer>
                </DataGridScrollArea>
            </DataGridContainer>
        </DataGridProvider>
    );
};

const clxs = {
    table: 'text-sm max-h-[400px]',
    headerGroup: 'bg-white dark:bg-gray-950 ',
    header: 'bg-white dark:bg-gray-950 flex items-center border border-transparent p-2 text-left font-medium text-gray-400 dark:text-gray-200',
    row: 'overflow-hidden border-gray-200 dark:border-gray-600',
    rowPinned: `
        data-pinned:z-20
        data-last-top:border-b-2
        data-first-bottom:border-t-2
    `,
    cell: 'user-select-none bg-white flex items-center border border-transparent p-2 text-gray-500 outline-blue-600 dark:text-gray-400 dark:bg-gray-800',
    cellActive: `
        data-active:bg-white 
        data-active:outline 
        data-active:outline-offset-[-1px]
        data-active:bg-gray-800
        dark:data-active:bg-gray-800
    `,
    cellSelected: `
        data-selected:bg-blue-950
        data-[edge-top=true]:border-t-blue-600
        data-[edge-left=true]:border-l-blue-600 
        data-[edge-right=true]:border-r-blue-600 
        data-[edge-bottom=true]:border-b-blue-600
    `,
    cellPinned: `
        data-[pinned=left]:z-10
        data-[pinned=right]:z-9
        data-[last-left=true]:border-r-gray-600 
        data-[first-right=true]:border-l-gray-600
        dark:data-[last-left=true]:border-r-gray-600
        dark:data-[first-right=true]:border-l-gray-600
    `,
    selectedRangeRect: 'absolute pointer-events-none outline-2 outline-offset-[-2px] outline-blue-600 bg-blue-600/5',
};
