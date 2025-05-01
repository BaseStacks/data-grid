import React, { memo, useEffect, useRef } from 'react';
import { useDataGridContext } from '../hooks/useDataGridContext';
import type { ColumnHeader } from '../../host';

interface DataGridHeaderProps<TElement extends HTMLElement> extends React.HTMLAttributes<TElement> {
    readonly as?: string
    readonly header: ColumnHeader;
}

function DataGridHeaderImpl<TElement extends HTMLElement = HTMLElement>({ as, header, children, ...props }: DataGridHeaderProps<TElement>) {
    const ref = useRef<TElement>(null);
    const { layout } = useDataGridContext();

    const Component = as || 'div' as React.ElementType;

    useEffect(() => {
        layout.registerNode(header.id, ref.current!);
        return () => {
            layout.removeNode(header.id);
        };
    }, [layout, header.id, ref]);

    return (
        <Component {...props} ref={ref}>
            {children ?? header.render()}
        </Component>
    );
};

export const DataGridHeader = memo(DataGridHeaderImpl);
