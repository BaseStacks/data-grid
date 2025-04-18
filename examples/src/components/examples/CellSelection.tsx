import { Column, DataGridProvider, useDataGrid, useDataGridState, DataGridContainer, DataGridCell, CellSelectionPlugin, usePlugin, DataGridHeader, DataGridHeaderGroup, DataGridRow, LayoutPlugin, DataGridScrollArea } from '@basestacks/data-grid';
import { useMemo, useState } from 'react';
import { generateData } from '@/helpers/dataHelpers';
import { cn } from '@/utils/cn';

export function CellSelection() {
    const columns = useMemo((): Column[] => [
        { dataKey: 'id', header: 'ID', pinned: 'left' },
        { dataKey: 'firstName', header: 'First Name', pinned: 'left' },
        { dataKey: 'lastName', header: 'Last Name' },
        { dataKey: 'age', header: 'Age' },
        { dataKey: 'address', header: 'Address' },
        { dataKey: 'email', header: 'Email' },
        { dataKey: 'phone', header: 'Phone' },
        { dataKey: 'actions', header: 'Actions', pinned: 'right' },
    ], []);

    const [data, setData] = useState(() => {
        return generateData({
            fields: [
                { name: 'id', type: 'number', required: true },
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

    const dataGrid = useDataGrid({
        data,
        columns,
        onChange: setData,
    });

    usePlugin(dataGrid, LayoutPlugin, {});
    usePlugin(dataGrid, CellSelectionPlugin, {});

    const headers = useDataGridState(dataGrid.state.headers);
    const rows = useDataGridState(dataGrid.state.rows);

    return (
        <DataGridProvider dataGrid={dataGrid}>
            <DataGridContainer className={clxs.table}>
                <DataGridHeaderGroup>
                    {headers.map((header, index) => (
                        <DataGridHeader key={index} header={header} className={clxs.header} />
                    ))}
                </DataGridHeaderGroup>
                <DataGridScrollArea className="relative h-[calc(400px-42px)] overflow-x-visible overflow-y-auto">
                    {rows.map((row, index) => (
                        <DataGridRow key={index} className={clxs.row}>
                            {row.cells.map((cell) => (
                                <DataGridCell key={cell.id} cell={cell} className={cn(clxs.cell, clxs.cellActive, clxs.cellSelected, clxs.cellPinned)}>
                                    {cell.render()}
                                </DataGridCell>
                            ))}
                        </DataGridRow>
                    ))}
                </DataGridScrollArea>
            </DataGridContainer>
        </DataGridProvider>
    );
};

const clxs = {
    table: 'text-sm user-select-none max-h-[400px]',
    header: 'bg-white dark:bg-gray-950 flex items-center border-gray-200 p-2 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200',
    row: 'overflow-hidden border-b border-gray-200 dark:border-gray-600',
    cell: 'bg-white flex items-center border border-transparent p-2 text-gray-500 outline-blue-600 dark:text-gray-400 dark:bg-gray-800',
    cellActive: `
        data-[active=true]:bg-white 
        data-[active=true]:outline 
        data-[active=true]:outline-offset-[-1px]
        data-[active=true]:bg-gray-800
        dark:data-[active=true]:bg-gray-800
    `,
    cellSelected: `
        data-[selected=true]:bg-blue-950
        data-[edge-top=true]:border-t-blue-600
        data-[edge-left=true]:border-l-blue-600 
        data-[edge-right=true]:border-r-blue-600 
        data-[edge-bottom=true]:border-b-blue-600
    `,
    cellPinned: `
        data-[last-left=true]:border-r-gray-600 
        dark:data-[last-left=true]:border-r-gray-600
        data-[first-right=true]:border-l-gray-600
        dark:data-[first-right=true]:border-l-gray-600
    `,
    selectedRangeRect: 'absolute pointer-events-none outline-2 outline-offset-[-2px] outline-blue-600 bg-blue-600/5',
};
