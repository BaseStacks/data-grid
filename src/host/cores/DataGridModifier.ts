import type { RowData, RowOperation } from '../types';
import type { DataGridPlugin } from '../atomic/DataGridPlugin';
import { calculateRangeBoundary } from '../utils/selectionUtils';
import { DataGridStates } from './DataGridStates';

export class DataGridModifier<TRow extends RowData = RowData> {
    constructor(private state: DataGridStates<TRow>) {
    }

    public plugins: Map<string, DataGridPlugin<TRow>> = new Map();


    public isCellDisabled = (rowIndex: number, columnIndex: number) => {
        const { columns } = this.state.options;

        const column = columns[columnIndex];
        if (column) {
            const disabled = column.disabled;
            return typeof disabled === 'function' ? disabled({ value: {}, rowIndex }) : disabled;
        }
        return false;
    };

    public updateData = (rowIndex: number, item: TRow) => {
        const { onChange, data } = this.state.options;
        onChange?.(
            [
                ...(data?.slice(0, rowIndex) ?? []),
                item,
                ...(data?.slice(rowIndex + 1) ?? []),
            ],
            [
                {
                    type: 'UPDATE',
                    fromRowIndex: rowIndex,
                    toRowIndex: rowIndex + 1,
                },
            ]
        );
    };

    public deleteSelection = () => {
        const { activeCell, selectedRanges } = this.state;
        const { onChange, columns, data } = this.state.options;
        if (!onChange) {
            return;
        }

        if (!activeCell.value) {
            return;
        }

        const newData = [...data];
        const operations: RowOperation[] = [];

        for (const selectedRange of selectedRanges.value) {
            const { min, max } = calculateRangeBoundary(selectedRange);

            for (let row = min.rowIndex; row <= max.rowIndex; ++row) {
                const modifiedRowData = { ...newData[row] };

                for (let col = min.columnIndex; col <= max.columnIndex; ++col) {
                    const column = columns[col];
                    if (!column.key) {
                        continue;
                    }

                    const cellDisabled = this.isCellDisabled(row, col);
                    if (cellDisabled) {
                        continue;
                    }

                    delete modifiedRowData[column.key];
                }

                newData[row] = modifiedRowData;
            }

            operations.push({
                type: 'UPDATE',
                fromRowIndex: min.rowIndex,
                toRowIndex: max.rowIndex + 1,
            });
        }

        onChange(newData, operations);
    };

    public insertRowAfter = (rowIndex: number, count = 1) => {
        const { editing } = this.state;
        const { createRow, onChange, data, lockRows } = this.state.options;

        if (lockRows) {
            return;
        }

        editing.set(false);

        const newRows = new Array(count).fill(0).map(() => createRow ? createRow() : {} as TRow);

        onChange?.(
            [
                ...data.slice(0, rowIndex + 1),
                ...newRows,
                ...data.slice(rowIndex + 1),
            ],
            [{
                type: 'CREATE',
                fromRowIndex: rowIndex + 1,
                toRowIndex: rowIndex + 1 + count,
            }]
        );
    };

    public duplicateRows = (rowMin: number, rowMax: number = rowMin) => {
        const { onChange, duplicateRow, data, lockRows } = this.state.options;
        if (lockRows) {
            return;
        }

        const duplicatedData = data.slice(rowMin, rowMax + 1).map((rowData, i) => duplicateRow ? duplicateRow({ rowData, rowIndex: i + rowMin }) : { ...rowData });

        onChange?.(
            [
                ...data.slice(0, rowMax + 1),
                ...duplicatedData,
                ...data.slice(rowMax + 1),
            ],
            [{
                type: 'CREATE',
                fromRowIndex: rowMax + 1,
                toRowIndex: rowMax + 2 + rowMax - rowMin,
            }]
        );
    };

    public applyPasteData = async (pasteData: string[][]) => {
        const { selectedRanges, editing } = this.state;
        const { createRow, onChange, columns, data, lockRows } = this.state.options;

        const selectedRange = selectedRanges.value[0];
        if (!selectedRange || editing.value) {
            return;
        }

        const { min, max } = calculateRangeBoundary(selectedRange);

        const results = await Promise.all(
            pasteData[0].map((_, columnIndex) => {
                const column = columns[min.columnIndex + columnIndex];
                const values = pasteData.map((row) => row[columnIndex]);
                return column.prePasteValues?.(values) ?? values;
            })
        );

        pasteData = pasteData.map((_, rowIndex) =>
            results.map((column) => column[rowIndex])
        );

        // Paste single row
        if (pasteData.length === 1) {
            const newData = [...data];

            for (let columnIndex = 0; columnIndex < pasteData[0].length; columnIndex++) {
                const column = columns[min.columnIndex + columnIndex];
                const pasteValue = column?.pasteValue;

                if (!pasteValue) {
                    continue;
                }

                for (let rowIndex = min.rowIndex; rowIndex <= max.rowIndex; rowIndex++) {
                    if (!this.isCellDisabled(rowIndex, columnIndex + min.columnIndex)) {
                        newData[rowIndex] = await pasteValue({
                            rowData: newData[rowIndex],
                            value: pasteData[0][columnIndex],
                            rowIndex,
                        });
                    }
                }
            }

            onChange?.(newData, [
                {
                    type: 'UPDATE',
                    fromRowIndex: min.rowIndex,
                    toRowIndex: max.rowIndex + 1,
                },
            ]);

            return;
        }

        // Paste multiple rows
        let newData = [...data];
        const missingRows = min.rowIndex + pasteData.length - data.length;

        if (missingRows > 0) {
            if (!lockRows) {
                const newRowData = new Array(missingRows).fill(0).map(() => createRow ? createRow() : {} as TRow);
                newData = [...newData, ...newRowData];
            } else {
                pasteData.splice(pasteData.length - missingRows, missingRows);
            }
        }

        for (
            let columnIndex = min.columnIndex;
            (columnIndex < pasteData[0].length) && (columnIndex < columns.length - 1);
            columnIndex++
        ) {
            const pasteValue = columns[columnIndex]?.pasteValue;

            if (pasteValue) {
                for (let rowIndex = 0; rowIndex < pasteData.length; rowIndex++) {
                    const isCellDisabled = this.isCellDisabled(min.rowIndex + rowIndex, columnIndex);
                    if (isCellDisabled) {
                        continue;
                    }

                    newData[min.rowIndex + rowIndex] = await pasteValue({
                        rowData: newData[min.rowIndex + rowIndex],
                        value: pasteData[rowIndex][columnIndex],
                        rowIndex: min.rowIndex + rowIndex,
                    });
                }
            }
        }

        const operations: RowOperation[] = [
            {
                type: 'UPDATE',
                fromRowIndex: min.rowIndex,
                toRowIndex:
                    min.rowIndex +
                    pasteData.length -
                    (!lockRows && missingRows > 0 ? missingRows : 0),
            },
        ];

        if (missingRows > 0 && !lockRows) {
            operations.push({
                type: 'CREATE',
                fromRowIndex: min.rowIndex + pasteData.length - missingRows,
                toRowIndex: min.rowIndex + pasteData.length,
            });
        }

        onChange?.(newData, operations);
    };

    public deleteRows = (fromRow: number, toRow: number = fromRow) => {
        const { onChange, data, lockRows } = this.state.options;

        if (lockRows) {
            return;
        }

        onChange?.(
            [
                ...data.slice(0, fromRow),
                ...data.slice(toRow + 1),
            ],
            [
                {
                    type: 'DELETE',
                    fromRowIndex: fromRow,
                    toRowIndex: toRow + 1,
                },
            ]
        );
    };
};
