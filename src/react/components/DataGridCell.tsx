import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { type Cell } from '../../core';
import { useDataGridContext } from '../hooks/useDataGridContext';
import React from 'react';

interface DataGridCellProps<TElement extends HTMLElement> extends React.HTMLAttributes<TElement> {
    readonly as?: string
    readonly cell: Cell;
}

export function DataGridCell<TElement extends HTMLElement = HTMLElement>({ as, cell, children, ...props }: DataGridCellProps<TElement>) {
    const { layout, state } = useDataGridContext();
    const ref = useRef<TElement>(null);

    const Component = as || 'div' as React.ElementType;

    const style: React.CSSProperties = useMemo(() => ({
        ...props.style,
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '0',
    }), [props.style]);

    useLayoutEffect(() => {
        const unwatchColumnLayout = layout.columnLayoutsState.watchItem(cell.colId, ({ operation, item }) => {
            if (!ref.current) {
                return;
            };

            if (operation === 'remove') {
                return;
            }

            ref.current.style.width = `${item.width}px`;
            ref.current.style.left = item.left === undefined ? '' : `${item.left}px`;
            ref.current.style.right = item.right === undefined ? '' : `${item.right}px`;

            if (!item.header.column.pinned) {
                ref.current.removeAttribute('data-pinned');
                ref.current.removeAttribute('data-first-left');
                ref.current.removeAttribute('data-last-left');
                ref.current.removeAttribute('data-first-right');
                ref.current.removeAttribute('data-last-right');
                return;
            }

            ref.current.setAttribute('data-pinned', item.header.column.pinned);
            ref.current.setAttribute('data-first-left', item.firstLeftPinned ? 'true' : 'false');
            ref.current.setAttribute('data-last-left', item.lastLeftPinned ? 'true' : 'false');
            ref.current.setAttribute('data-first-right', item.firstRightPinned ? 'true' : 'false');
            ref.current.setAttribute('data-last-right', item.lastRightPinned ? 'true' : 'false');

            if (item.header.column.pinned === 'left') {
                ref.current.style.borderRightWidth = '1px';
                ref.current.style.zIndex = '2';
            }
            else if (item.header.column.pinned === 'right') {
                ref.current.style.borderLeftWidth = '1px';
                ref.current.style.zIndex = '1';
            }
        });

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
            unwatchColumnLayout();
            unwatchActiveCell();
            unwatchSelectedRanges();
        };
    }, [cell.colId, cell.id, layout.columnLayoutsState, state.activeCell, state.selectedRanges]);

    useEffect(() => {
        layout.registerNode(cell.id, ref.current!);
        return () => {

            layout.removeElement(cell.id);
        };
    }, [layout, cell.id, ref]);

    return (
        <Component {...props} ref={ref} style={style}>
            {children ?? cell.render()}
        </Component>
    );
};
