import { memo } from 'react';
import type { CellSelectionPlugin } from '../../../core';
import { useDataGridState } from '../../hooks/atomic/useDataGridState';

interface SelectedRangeRectsProps extends React.HTMLAttributes<HTMLElement> {
    readonly as?: React.ElementType;
    readonly selection: CellSelectionPlugin;
}

function SelectedRangeRectsImpl({ as, selection, style, ...props }: SelectedRangeRectsProps) {
    const rangeRects = useDataGridState(selection.state.selectedRangeRects);

    const Component = as || 'div';

    return rangeRects.map((rect, index) => (
        <Component
            {...props}
            key={index}
            style={{ ...rect, ...style, zIndex: 2 }}
        />
    ));
}

export const SelectedRangeRects = memo(SelectedRangeRectsImpl);
