import type { CellId, HeaderGroupId, HeaderId, RowContainerId, RowId } from '../../host';

export interface DataGridLayoutNodeBase {
    readonly element: HTMLElement;
    readonly pinned?: 'left' | 'right' | 'top' | 'bottom';
    readonly size: {
        readonly height: number;
        readonly width: number;
    },
    readonly offset: {
        readonly top?: number;
        readonly left?: number;
    },
    readonly attributes: Record<string, any>;
}

export interface DataGridCellNode extends DataGridLayoutNodeBase {
    readonly id: CellId;
    readonly type: 'cell',
    readonly rowId: RowId;
    readonly headerId: HeaderId;
    readonly active?: boolean;
    readonly focused?: boolean;
}

export interface DataGridHeaderNode extends DataGridLayoutNodeBase {
    readonly id: HeaderId;
    readonly type: 'header',
}

export interface DataGridRowNode extends DataGridLayoutNodeBase {
    readonly id: RowId;
    readonly type: 'row',
}

export interface DataGridHeaderGroupNode extends DataGridLayoutNodeBase {
    readonly id: HeaderGroupId;
    readonly type: 'headerGroup',
}

export interface DataGridRowContainerNode extends DataGridLayoutNodeBase {
    readonly id: RowContainerId;
    readonly type: 'rowContainer';
}

export type DataGridLayoutNode = DataGridCellNode | DataGridHeaderGroupNode | DataGridHeaderNode | DataGridRowNode | DataGridRowContainerNode;

export interface DomModifierOptions {
    readonly type: DataGridLayoutNode['type'];
    readonly attributes: string[];
}

export class DomModifier {
    constructor(public options: DomModifierOptions) {
    }

    public modify = (node: DataGridLayoutNode) => {
        const { top, left } = node.offset;
        const { width, height } = node.size;

        if (top !== undefined) {
            node.element.style.top = `${top}px`;
            node.element.style.position = 'absolute';
        }
        if (left !== undefined) {
            node.element.style.left = `${left}px`;
            node.element.style.position = 'absolute';
        }
        
        if (width !== undefined) {
            node.element.style.width = `${width}px`;
        }
        if (height !== undefined) {
            node.element.style.height = `${height}px`;
        }

        this.options.attributes.forEach((key) => {
            if (node.attributes[key] !== undefined) {
                node.element.setAttribute(key, node.attributes[key]);
            } else {
                node.element.removeAttribute(key);
            }
        });
    };

    public unmodify = (node: DataGridLayoutNode) => {
        node.element.style.top = '';
        node.element.style.position = '';
        node.element.style.left = '';
        node.element.style.position = '';
        node.element.style.width = '';
        node.element.style.height = '';

        this.options.attributes.forEach((key) => {
            node.element.removeAttribute(key);
        });
    };
}
