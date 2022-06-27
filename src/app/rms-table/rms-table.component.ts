import {
  Component,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-rms-table',
  templateUrl: './rms-table.component.html',
  styleUrls: ['./rms-table.component.css'],
})
export class RmsTableComponent {
  @Input() public columnDefs!: ColDef[];
  @Input() public rowData!: any[];
  @Input() public totalRecords!: number;

  @Output() updateGridData = new EventEmitter<any>();

  private gridApi: any;
  private columnApi: any;

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    floatingFilter: true,
    suppressMenu: true,
    floatingFilterComponentParams: { suppressFilterButton: true },
  };

  // paginator
  public pagination = true;
  public pageSize = 50;
  public pageIndex = 0;

  // filter
  public isFilterApplied = false;

  // For accessing the Grid's API
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) {}

  // Example load data from sever
  onGridReady(params: GridReadyEvent) {
    this.http.get<any[]>('http://localhost:3000/photos').subscribe((data) => {
      this.rowData = (data as Array<any>).slice(0, 50);
      this.totalRecords = data.length;
    });
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  // Example of consuming Grid Event
  onCellClicked(e: CellClickedEvent): void {
    console.log('cellClicked', e);
  }

  // Example using Grid's API
  clearSelection(): void {
    this.agGrid.api.deselectAll();
    this.clearFilters();
  }

  filterOpened($event: any): void {
    console.log('filterOpened......', $event);
  }

  onFilterModified($event: any): void {
    //  console.log('onFilterModified......', $event);
  }
  moveToFirstPage = () => {
    this.paginator.firstPage();
  };

  onFilterChanged($event: any): void {
    let filters = this.getFilterObject(this.gridApi?.getFilterModel());
    if (!filters) return;

    this.moveToFirstPage();
    this.fetchGridData($event, false, true)
  }

  onRowClicked($event: any): void {
    console.log('onRowClicked......', $event);
  }

  onColumnResized($event: any): void {
    console.log('onColumnResized......', $event);
  }

  clearFilters() {
    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();
  }

  changePageSize() {
    this.gridApi.paginationSetPageSize(100);
  }

  pageChanged($event: any) {
    this.fetchGridData($event, true, false)
  }

  sortChanged($event: any) {
    this.fetchGridData($event, false, false)
  }

  getFilterObject(params = {}) {
    if (Object.keys(params).length === 0) {
      return null;
    }
    return params;
  }

  getSortModel(params = []) {
    let sortModel: { colId: any; sort: any }[] = [];
    params.forEach((element: any) => {
      const { colId, sort } = element;
      if (element.sort) {
        sortModel.push({ colId, sort });
      }
    });
    return sortModel || null;
  }

  fetchGridData(event: any, pageChangeEvent: boolean, isfilterChangeEvent: boolean) {
    const filters = this.getFilterObject(this.gridApi?.getFilterModel());
    const sortModel = this.getSortModel(this.columnApi?.getColumnState?.());
    let pageIndex = 0;
    let pageSize = this.pageSize
    if(isfilterChangeEvent) {
      pageIndex = isfilterChangeEvent ? 1 : this.pageIndex +1
    } else if(pageChangeEvent){
      const { pageSize: pgSize, pageIndex: index } = event;
      pageIndex = index +1
      pageSize = pgSize
    }
    this.updateGridData.emit({
      filters,
      pageIndex: isfilterChangeEvent ? 1 : this.pageIndex +1,
      pageSize,
      sortModel
    });
  }
}
