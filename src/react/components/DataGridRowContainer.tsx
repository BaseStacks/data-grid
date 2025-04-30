import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useDataGridContext } from '../hooks/useDataGridContext';

export interface DataGridRowContainerProps extends React.HTMLAttributes<HTMLElement> {
    readonly as?: string;
}

function DataGridRowContainerImpl({ as = 'div', ...props }: React.PropsWithChildren<DataGridRowContainerProps>) {
    const { layout } = useDataGridContext();
    const ref = useRef<HTMLElement>(null);

    const Component = (as || 'div') as React.ElementType;

    useEffect(() => {
        layout.registerNode('rowContainer:1', ref.current!);
        return () => {
            layout.removeNode('rowContainer:1');
        };
    }, [layout]);

    return (
        <Component
            {...props}
            ref={ref}
        />
    );
};

export const DataGridRowContainer = memo(DataGridRowContainerImpl);
