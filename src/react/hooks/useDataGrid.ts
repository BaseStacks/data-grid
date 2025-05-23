import { useEffect, useRef } from 'react';
import type { DataGridOptions, RowData } from '../../host';
import { DataGrid } from '../../dom/DataGrid';

export type UseDataGridReturn<TRow extends RowData = RowData> = ReturnType<typeof useDataGrid<TRow>>;

export const useDataGrid = <TRow extends RowData>(options: DataGridOptions<TRow>) => {
    const dataGridController = useRef<DataGrid<TRow>>(null);
    dataGridController.current = dataGridController.current ?? new DataGrid<TRow>(options);

    useEffect(() => {
        dataGridController.current!.updateOptions(options);
    }, [options]);

    return dataGridController.current;
};
