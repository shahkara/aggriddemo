import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AgGridAngular } from 'ag-grid-angular';
import { CellClickedEvent, ColDef, GridReadyEvent } from 'ag-grid-community';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    { field: 'id' },
    { field: 'albumId' },
    { field: 'title' },
    { field: 'url' },
  ];

  gridApi: any;
  columnApi: any;

  // DefaultColDef sets props common to all Columns
  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    floatingFilter: true,
    suppressMenu: true,
    floatingFilterComponentParams: { suppressFilterButton: true },
    // onFilterChanged: () => {console.log('onFilterChanged');},
    // onFilterModified: function() {console.log('onFilterModified');}
  };

  // Data that gets displayed in the grid
  // public rowData$!: Observable<any[]>;
  public rowData!: any[];

  public pagination = true;
  // public paginationPageSize = 50;

  // paginator
  public totalRecords = 100;
  public pageSize = 50;
  public pageIndex = 0;

  // filter
  public isFilterApplied = false;

  gridOptions = {
    // PROPERTIES
    // Objects like myRowData and myColDefs would be created in your application
    rowData: this.rowData,
    columnDefs: this.columnDefs,
    pagination: true,
    rowSelection: 'single',

    // EVENTS
    // Add event handlers
    // onRowClicked: ($event: any) => console.log('A row was clicked', $event),
    // onColumnResized: ($event: any) =>
    //   console.log('A column was resized', $event),
    // onGridReady: ($event: any) => console.log('The grid is now ready', $event),
    // onFilterModified: ($event: any) => console.log('onFilterModified', $event),
    // onFilterChanged: ($event: any) => console.log('onFilterChanged', $event),
  };

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
    // this.http
    //   .get('https://www.ag-grid.com/example-assets/row-data.json')
    //   .subscribe((data) => {
    //     const filter = 'por';
    //     const filteredRecords = (data as Array<any>).filter((item) => {
    //       console.log(item)
    //       if (item['make']?.toLowerCase().includes(filter)) return true;
    //       return false;
    //     });
    //     console.log('length::', filteredRecords.length,  (data as Array<any>).length)
    //     localStorage.setItem('filteredRecords', JSON.stringify(filteredRecords));

    //  });

    // refresh the grid
    //this.gridOptions.api.redrawRows();

    // resize columns in the grid to fit the available space
    //this.gridOptions.columnApi.sizeColumnsToFit();
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

  onFilterChanged($event: any): void {
    console.log('onFilterChanged......', $event);
    console.log(
      'this.gridApi.getFilterModel()......',
      this.gridApi.getFilterModel()
    );

    // return
    // below code logic is not required if filtering is required pagewise only
    const filters = this.gridApi?.getFilterModel() || {};
    if (Object.keys(filters).length === 0) {
      // this.clearFilters()
      return;
    }
    // console.log('filtermodel:::', this.gridApi.getFilterModel()?.id.filter);
    let filteredRecords;
    this.http.get<any[]>('http://localhost:3000/photos').subscribe((data) => {
      let matched = false;
      filteredRecords = (data as Array<any>).filter((row) => {
        return Object.keys(filters)?.every((key) => {
          const value = row[key] && String(row[key]).toLocaleLowerCase();
          if (value.includes(filters[key].filter)) {
            return true;
          }
          return false;
        });
      });

      // this.rowData = (data as Array<any>).slice(0, 50)
      console.log('filteredRecords:::', filteredRecords);
      this.paginator.firstPage();
      this.rowData = filteredRecords;

      this.totalRecords = filteredRecords?.length || 0;
      // this.gridApi.redrawRows();
    });

    // get new filtered from api
    // this.rowData$ = of(
    //   JSON.parse(localStorage.getItem('filteredRecords') || '')
    // );

    //   this.gridApi.forEachNode((rowNode: any, index: any) => {
    //     console.log('node ' + rowNode + ' is in the grid');
    // });
    //  sessionStorage.setItem('filteredRecords', JSON.stringify(this.rowData$.))
    //  console.log('$event.api.filterManager.allFilters::', $event.api.filterManager.allColumnFilters.get('make'))
    // if (!$event.api.filterManager.allColumnFilters.get('make')) return;

    // $event.api.filterManager.allColumnFilters.get('make').filterPromise.then((result :any) => {
    //   console.log('##### Selected Values #####', result)
    //   const values = result.virtualList.model.model.selectedValuesMap;
    //   const selectedValues = [];
    //   for(var key in values) {
    //     selectedValues.push(key);
    //   }
    //   console.log(selectedValues.join(', '));
    // });
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
    console.log($event);
    const { pageSize, pageIndex } = $event;
    this.http
      .get<any[]>(
        `http://localhost:3000/photos?_page=${pageIndex + 1}&_limit=${pageSize}`
      )
      .subscribe((data) => {
        this.rowData = data as Array<any>;
        //this.totalRecords = data.length
      });
    // length: 100
    // pageIndex: 1
    // pageSize: 50
    // previousPageIndex: 0
  }

  sortChanged($event: any) {
    const sortState = this.gridApi.getSortModel();
    console.log('sortChanged', sortState);
  }

  fetchUpdatedData(params: any) {
    const { filters } = params;
    console.log('fetchUpdatedData::', params);
    let filteredRecords;
    this.http.get<any[]>('http://localhost:3000/photos').subscribe((data) => {
      let matched = false;
      if (filters) {
        filteredRecords = (data as Array<any>).filter((row) => {
          return Object.keys(filters)?.every((key) => {
            const value = row[key] && String(row[key]).toLocaleLowerCase();
            if (value?.includes(filters[key].filter)) {
              return true;
            }
            return false;
          });
        });
      } else{
        filteredRecords = data;
      }

      // this.rowData = (data as Array<any>).slice(0, 50)
      console.log('filteredRecords:::', filteredRecords);
      // params.callBack();
      this.rowData = filteredRecords;
      this.totalRecords = filteredRecords?.length || 0;
      // this.gridApi.redrawRows();
    });
  }
}
