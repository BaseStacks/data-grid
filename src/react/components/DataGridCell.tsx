import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { type CellRender } from '../../host';
import { useDataGridContext } from '../hooks/useDataGridContext';
import React from 'react';

interface DataGridCellProps<TElement extends HTMLElement> extends React.HTMLAttributes<TElement> {
    readonly as?: string
    readonly cell: CellRender;
}

function DataGridCellImpl<TElement extends HTMLElement = HTMLElement>({ as, cell, children, ...props }: DataGridCellProps<TElement>) {
    const { layout, state } = useDataGridContext();
    const ref = useRef<TElement>(null);

    const Component = as || 'div' as React.ElementType;

    const style: React.CSSProperties = useMemo(() => ({
        ...props.style,
        height: '100%',
    }), [props.style]);

    useLayoutEffect(() => {
        const unwatchActiveCell = state.activeCell.watch((activeCell) => {
            if (!ref.current) {
                return;
            }

            if (activeCell?.id === cell.id) {
                ref.current.setAttribute('data-active', 'true');
            }
            else {
                ref.current.removeAttribute('data-active');
            }
        });

        const unwatchSelectedRanges = state.selectedRanges.watch((selectedRanges) => {
            if (!ref.current) {
                return;
            }

            const edges: Set<string> = new Set();
            let hasSelectedRange = false;

            selectedRanges.forEach(selectedRange => {
                const cellInRange = selectedRange.cells.get(cell.id);
                if (!cellInRange) {
                    return;
                }
                hasSelectedRange = true;
                if (cellInRange.edges.length) {
                    cellInRange.edges.forEach(edge => {
                        edges.add(edge);
                    });
                }
            });

            ref.current.removeAttribute('data-edge-top');
            ref.current.removeAttribute('data-edge-bottom');
            ref.current.removeAttribute('data-edge-left');
            ref.current.removeAttribute('data-edge-right');

            if (!hasSelectedRange) {
                ref.current.removeAttribute('data-selected');
                return;
            }

            ref.current.setAttribute('data-selected', 'true');
            edges.forEach(edge => {
                ref.current!.setAttribute(`data-edge-${edge}`, 'true');
            });
        });

        return () => {
            unwatchActiveCell();
            unwatchSelectedRanges();
        };
    }, [cell.id, layout, state.activeCell, state.selectedRanges]);

    useEffect(() => {
        layout.registerNode(cell.id, ref.current!);
        return () => {
            layout.removeNode(cell.id);
        };
    }, [layout, cell.id]);

    return (
        <Component {...props} ref={ref} style={style}>
            {children ?? cell.render()}
        </Component>
    );
};

export const DataGridCell = memo(DataGridCellImpl) as typeof DataGridCellImpl;
