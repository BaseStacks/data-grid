import React from 'react';
import { DataGridContext } from '../contexts';
import { RowData } from '../../core';
import { UseDataGridReturn } from './useDataGrid';

export function useDataGridContext<TRow extends RowData = RowData>() {
    const context = React.useContext<UseDataGridReturn<TRow>>(DataGridContext);

    if (!context) {
        throw new Error('useDataGridContext must be used within a DataGridProvider');
    }

    return context;
};
