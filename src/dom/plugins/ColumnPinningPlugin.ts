import type { ColumnKey, ColumnHeader, RowData } from '../../host';
import { DataGridDomPlugin } from '../atomic/DataGridDomPlugin';
import { type DataGridCellNode, type DataGridHeaderNode } from '../helpers/DomModifier';

export interface ColumnPinningPluginOptions {
    readonly pinnedLeftColumns?: ColumnKey[];
    readonly pinnedRightColumns?: ColumnKey[];
}

export class ColumnPinningPlugin<TRow extends RowData> extends DataGridDomPlugin<TRow, ColumnPinningPluginOptions> {
    private _lastScrollLeft: number = 0;

    private _leftHeaders: ColumnHeader[] = [];
    private _bodyHeaders: ColumnHeader[] = [];
    private _rightHeaders: ColumnHeader[] = [];
    private _rightHeadersDesc: ColumnHeader[] = [];

    private setupHeaderNodes = () => {
        const { headers, options } = this.dataGrid.state;
        const { getNode, updateNode } = this.dataGrid.layout;

        // Set default column width based on scrollArea width
        const scrollAreaWidth = this.scrollArea!.clientWidth;
        const columnCount = headers.value.length;
        const defaultColumnWidth = Math.floor(scrollAreaWidth / columnCount);
        const columnWidth = Math.max(this.dataGrid.options.columnMinWidth, Math.min(defaultColumnWidth, this.dataGrid.options.columnMaxWidth));

        this._leftHeaders.forEach((header, index, leftHeaders) => {
            const headerNode = getNode(header.id) as DataGridHeaderNode;

            updateNode(this, headerNode.id, {
                pinned: 'left',
                size: {
                    height: options.rowHeight,
                },
                attributes: {
                    'data-pinned': 'left',
                    'data-fist-left': (index === 0) || undefined,
                    'data-last-left': (index === leftHeaders.length - 1) || undefined,
                }
            });
        });

        this._bodyHeaders.forEach((header, index) => {
            const headerNode = getNode(header.id) as DataGridHeaderNode;

            updateNode(this, headerNode.id, {
                offset: {
                    left: (index + this._leftHeaders.length) * columnWidth
                }
            });
        });

        this._rightHeaders.forEach((header, index, rightHeaders) => {
            const headerNode = getNode(header.id) as DataGridHeaderNode;

            updateNode(this, headerNode.id, {
                pinned: 'right',
                attributes: {
                    'data-pinned': 'right',
                    'data-first-right': (index === 0) || undefined,
                    'data-last-right': (index === rightHeaders.length - 1) || undefined,
                }
            });
        });
    };

    private updateHeaderNodes = () => {
        const { getNode, updateNode } = this.dataGrid.layout;

        const baseLeft = this.scrollArea!.scrollLeft;

        let pinnedLeftOffset = baseLeft;

        this._leftHeaders.forEach((header) => {
            const headerNode = getNode(header.id);
            if (!headerNode) {
                return;
            }

            const nodeOffset = pinnedLeftOffset;
            pinnedLeftOffset += headerNode.size.width!;

            const needUpdate = headerNode.offset.left !== nodeOffset;
            if (!needUpdate) {
                return;
            }

            updateNode(this, header.id, {
                offset: {
                    left: nodeOffset
                }
            });
        });

        const viewportWidth = this.scrollArea!.clientWidth;
        let pinnedRightOffset = baseLeft + viewportWidth;
        this._rightHeadersDesc.forEach((header) => {
            const headerNode = getNode(header.id);
            if (!headerNode) {
                return;
            }

            pinnedRightOffset -= headerNode.size.width!;
            const nodeOffset = pinnedRightOffset;

            const needUpdate = headerNode.offset.left !== nodeOffset;
            if (!needUpdate) {
                return;
            }

            updateNode(this, header.id, {
                offset: {
                    left: nodeOffset
                }
            });
        });
    };

    private updateCellNodes = () => {
        const { getNode, getNodesByType, updateNode } = this.dataGrid.layout;

        const cellNodes = getNodesByType<DataGridCellNode>('cell');

        cellNodes.forEach((cellNode) => {
            const headerNode = getNode(cellNode.headerId);
            if (!headerNode) {
                return;
            }

            updateNode(this, cellNode.id, {
                offset: {
                    left: headerNode.offset.left
                },
                attributes: headerNode.attributes
            });
        });
    };

    private handleContainerScroll = () => {
        const isScrollingLeft = this.scrollArea!.scrollLeft != this._lastScrollLeft;
        if (!isScrollingLeft) {
            return;
        }

        this._lastScrollLeft = this.scrollArea!.scrollLeft;
        this.updateHeaderNodes();
        this.updateCellNodes();
    };

    public handleActivate = () => {
        this.dataGrid.layout.registerDomModifier(this, {
            type: 'header',
            attributes: ['data-pinned', 'data-fist-left', 'data-last-left', 'data-first-right', 'data-last-right']
        });

        this.dataGrid.layout.registerDomModifier(this, {
            type: 'cell',
            attributes: []
        });

        this.scrollArea!.addEventListener('scroll', this.handleContainerScroll);
        this.unsubscribes.push(() => {
            this.scrollArea!.removeEventListener('scroll', this.handleContainerScroll);
        });

        const watchHeaders = this.dataGrid.state.headers.watch((newHeaders) => {
            const { pinnedRightColumns, pinnedLeftColumns } = this.options;

            this._leftHeaders = pinnedLeftColumns ? newHeaders.filter((header) => pinnedLeftColumns.includes(header.column.key)) : [];
            this._rightHeaders = pinnedRightColumns ? newHeaders.filter((header) => pinnedRightColumns.includes(header.column.key)) : [];
            this._bodyHeaders = newHeaders.filter(header => !this._leftHeaders.includes(header) && !this._rightHeaders.includes(header));
            this._rightHeadersDesc = [...this._rightHeaders].reverse();

            this.setupHeaderNodes();
            this.updateHeaderNodes();
            this.updateCellNodes();
        });
        this.unsubscribes.push(watchHeaders);

        const resizeObserver = new ResizeObserver(() => {
            this.updateHeaderNodes();
            this.updateCellNodes();
        });
        resizeObserver.observe(this.scrollArea!);
        this.unsubscribes.push(() => {
            resizeObserver.disconnect();
        });
    };
}
