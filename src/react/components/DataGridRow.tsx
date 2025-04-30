import { memo, useEffect, useMemo, useRef } from 'react';
import { useDataGridContext } from '../hooks/useDataGridContext';
import type { Row } from '../../host';

export interface DataGridRowProps extends React.HTMLAttributes<HTMLElement> {
    readonly as?: string;
    readonly row: Row;
}

function DataGridRowImpl({
    as = 'div',
    row,
    ...props
}: React.PropsWithChildren<DataGridRowProps>) {
    const { layout } = useDataGridContext();
    const ref = useRef<HTMLElement>(null);

    const Component = (as || 'div') as React.ElementType;

    useEffect(() => {
        layout.registerNode(row.id, ref.current!);
        return () => {
            layout.removeNode(row.id);
        };
    }, [layout, row.id]);

    return (
        <Component {...props} ref={ref} />
    );
};

export const DataGridRow = memo(DataGridRowImpl);
