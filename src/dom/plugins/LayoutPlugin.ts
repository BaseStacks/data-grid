import type { Id, RowData } from '../../host';
import { DataGridDomPlugin } from '../atomic/DataGridDomPlugin';
import type { DataGridCellNode } from '../helpers/DomModifier';

export interface LayoutPluginOptions {
}

export class LayoutPlugin<TRow extends RowData> extends DataGridDomPlugin<TRow, LayoutPluginOptions> {
    private updateHeaderNodes = () => {
        const { columnMinWidth, columnMaxWidth } = this.dataGrid.options;
        const { headers } = this.dataGrid.state;
        const { getNodesByType, updateNode } = this.dataGrid.layout;

        const headerNodes = getNodesByType('header');

        const scrollAreaWidth = this.scrollArea!.clientWidth;
        const columnCount = headers.value.length;
        const defaultColumnWidth = Math.floor(scrollAreaWidth / columnCount);
        const columnWidth = Math.max(columnMinWidth, Math.min(defaultColumnWidth, columnMaxWidth));

        headers.value.forEach((header) => {
            const headerId = header.id as Id;
            const headerNode = headerNodes.find((node) => node.id === headerId);

            if (!headerNode) {
                return;
            }

            updateNode(this, headerId, {
                size: {
                    width: columnWidth,
                }
            });
        });
    };

    private updateHeaderGroupNodes = () => {
        const { getNode, getNodesByType, updateNode } = this.dataGrid.layout;

        const headerGroupNode = getNode('headerGroup:1');
        if (!headerGroupNode) {
            return;
        }

        const headerNodes = getNodesByType('header');
        const width = headerNodes.reduce((acc, node) => acc + node.size.width!, 0);

        updateNode(this, 'headerGroup:1', {
            size: {
                width: width,
            }
        });
    };

    private updateRowNodes = () => {
        const { getNodesByType, getNode, updateNode } = this.dataGrid.layout;

        const headerGroupNode = getNode('headerGroup:1');
        if (!headerGroupNode) {
            return;
        }

        let rowsHeight = 0;
        const rowNodes = getNodesByType('row');
        rowNodes.forEach((node) => {
            rowsHeight += node.size.height!;
            updateNode(this, node.id, {
                size: {
                    width: headerGroupNode.size.width,
                }
            });
        });

        const rowContainerNode = getNode('rowContainer:1');
        if (rowContainerNode) {
            updateNode(this, rowContainerNode.id, {
                size: {
                    width: headerGroupNode.size.width,
                    height: rowsHeight
                }
            });
        }
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
                size: {
                    width: headerNode.size.width
                }
            });
        });
    };

    public handleActivate = () => {
        const watchHeaders = this.dataGrid.state.headers.watch(() => {
            this.updateHeaderNodes();
            this.updateHeaderGroupNodes();
            this.updateRowNodes();
            this.updateCellNodes();
        });

        this.unsubscribes.push(watchHeaders);

        const resizeObserver = new ResizeObserver(() => {
            this.updateHeaderNodes();
            this.updateHeaderGroupNodes();
            this.updateRowNodes();
            this.updateCellNodes();
        });
        resizeObserver.observe(this.scrollArea!);
        this.unsubscribes.push(() => {
            resizeObserver.disconnect();
        });
    };
}
