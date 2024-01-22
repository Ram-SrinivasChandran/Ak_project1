import React, { Component } from "react";
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Reorder,
  Inject,
  Sort,
  Filter,
  Edit,
  Toolbar,
  Resize,
  VirtualScroll,
  ExcelExport,
} from "@syncfusion/ej2-react-grids";
import "../../Common/css/SyncfusionGridCustom.css";
import axios from "axios";
import { ActionTypes, ScreenType } from "../Store/Constants";
import {
  GetFormattedFileName,
  GetFormattedDateTime,
} from "../../Common/Actions/DateHandler";

class Grid extends Component {
  constructor() {
    super(...arguments);
    this.state = {
      gridHeight: window.innerHeight - 345,
      gridData: [],
    };
    if (window.RequestData.GridData && window.RequestData.GridData.length) {
      this.state.gridData = window.RequestData.GridData;
      this.setDateFormat(this.state.gridData);
    }

    this.updateGridHeight = this.updateGridHeight.bind(this);
    this.loadSearchData = this.loadSearchData.bind(this);

    this.filterSettings = {
      //showFilterBarOperator : true,
      immediateModeDelay: 300,
      mode: "Immediate", // to show search result immidiately
    };
  }
  setDateFormat = (gridData) => {
    gridData.map((d) => {
      d.RequestedAt = d.RequestedAt
        ? GetFormattedDateTime(new Date(d.RequestedAt))
        : "";
    });
  };
  loadSearchData(searchParam, dispatch) {
    let apiRootUrl = window.ApiRootUrl ? window.ApiRootUrl : "";
    let urlString = `${apiRootUrl}/ProviderRequest/GetProviderRequests`;

    if (window.IsConnected === true) {
      this.updateSearchStatus(dispatch, true);
      let data = {
        FromDate: searchParam.FromDate.Value,
        ToDate: searchParam.ToDate.Value,
        StatusIds: searchParam.StatusIds,
        Channels: searchParam.Channels?.join(","),
        ClientId: searchParam.Client.Value,
        AuditIds: searchParam.AuditIds.Value,
      };
      axios.post(urlString, data).then(
        (response) => {
          if (response.data != null && response.data != undefined) {
            //Convert server date format to js date object
            this.setDateFormat(response.data);
            this.setState({ gridData: response.data });
            this.updateSearchStatus(dispatch, false, response.data.length);
          } else {
            //For custom error page
            this.handleSearchError(response, dispatch);
          }
        },
        (e) => {
          this.handleSearchError(e, dispatch);
        }
      );
    }
  }
  export() {
    if (this.grid && this.grid.columns[0]) {
      for (let i = 0; i < this.grid.columns.length; i++) {
        this.grid.columns[i].previousVisible = this.grid.columns[i].visible;
        this.grid.columns[i].visible = true;
      }
      this.grid.columns[0].visible = false; //To hide action column while export
    }

    var date = new Date();
    let excelExportProperties = {
      fileName: GetFormattedFileName("ProviderRequest_", ".xlsx"),
    };

    this.grid.excelExport(excelExportProperties);
  }
  excelExportComplete() {
    if (this.grid && this.grid.columns[0]) {
      for (let i = 0; i < this.grid.columns.length; i++) {
        this.grid.columns[i].visible = this.grid.columns[i].previousVisible;
      }
    }
  }

  updateSearchStatus(dispatch, isSearchInProgress, resultCount = null) {
    dispatch({
      type: ActionTypes.UPDATES_SEARCHSTATUS,
      payload: { isSearchInProgress, resultCount },
    }); //dispatch grid data
  }
  handleSearchError(e, dispatch) {
    window.alert("System failed to fetch data. Please contact support team.");
    window.console.error(e);
    this.updateSearchStatus(dispatch, false);
  }
  updateGridHeight() {
    this.setState({ gridHeight: window.innerHeight - 345 });
  }
  componentDidMount() {
    window.addEventListener("resize", this.updateGridHeight);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.CurrentScreen != prevProps.CurrentScreen) {
      this.grid.refresh();
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateGridHeight);
  }
  databound() {
    if (this.grid) {
      //this.grid.columns=GridColumns;
      /*free search with contains is allowed on string type columns as per ej2*/
      this.grid.getColumns().filter((column) => {
        if (column.type === "string") {
          if (column.filter === undefined) {
            column.filter = {};
          }
          column.filter.operator = "contains";
        }
        return column;
      });
    }
  }

  recordDoubleClick(args) {
    if (this.props.onRowSelected) this.props.onRowSelected(args.rowData.Id);
  }

  /** Custom comparer function */
  dateSortComparer(reference, comparer) {
    if (reference !== "" && comparer !== "") {
      if (new Date(reference) < new Date(comparer)) {
        return -1;
      }
      if (new Date(reference) > new Date(comparer)) {
        return 1;
      }
    } else if (reference !== "" && comparer === "") {
      return 1;
    } else if (reference === "" && comparer !== "") {
      return -1;
    }
    return 0;
  }

  numericSorter = (reference, comparer) => {
    if (reference && comparer) {
      if (+reference < +comparer) {
        return -1;
      }
      if (+reference > +comparer) {
        return 1;
      }
      if (+reference == +comparer) {
        return -1;
      }
    } else if (reference && !comparer) {
      return 1;
    } else if (!reference && comparer) {
      return -1;
    }
  };

  render() {
    return (
      <div
        className="tblht"
        style={{
          width:
            this.props.CurrentScreen == ScreenType.Grid
              ? "100%"
              : this.props.CurrentScreen == ScreenType.AddForm ||
                this.props.CurrentScreen == ScreenType.EditForm
              ? "37.5%"
              : this.props.CurrentScreen == ScreenType.GridWithCurrentRequests
              ? "55.5%"
              : "0",
        }}
      >
        <div className="grey-bg2 show" id="psq_main">
          <GridComponent
            dataSource={this.state.gridData}
            height={this.state.gridHeight}
            enableVirtualization={true}
            //enableImmutableMode={true}
            ref={(grid) => (this.grid = grid)}
            allowPaging={false}
            gridLines="Both"
            allowSorting={true}
            allowResizing={true}
            allowReordering={true}
            allowFiltering={true}
            allowExcelExport={true}
            filterSettings={this.filterSettings}
            dataBound={this.databound.bind(this)}
            excelExportComplete={this.excelExportComplete.bind(this)}
            recordDoubleClick={this.recordDoubleClick.bind(this)}
            clipMode="EllipsisWithTooltip"
          >
            <ColumnsDirective>
              <ColumnDirective
                field="Action"
                headerText="Action"
                allowFiltering={false}
                allowSorting={false}
                width="70"
                textAlign="Center"
                allowReordering={false}
                template={(props) => (
                  <span
                    className="glyphicon glyphicon-edit"
                    onClick={() => {
                      if (this.props.onRowSelected) {
                        this.props.onRowSelected(props?.Id);
                      }
                    }}
                  ></span>
                )}
              />
              <ColumnDirective
                field="Id"
                headerText="Request Id"
                width="80"
                type="string"
                isPrimaryKey={true}
                sortComparer={this.numericSorter}
              />
              <ColumnDirective
                field="CapName"
                headerText="Client Audit Program"
                width="180"
                type="string"
              />
              <ColumnDirective
                field="FlowName"
                headerText="Flow"
                width="150"
                type="string"
              />
              <ColumnDirective
                field="AuditId"
                headerText="Audit Id"
                width="80"
                type="string"
                template={(props) =>
                  props.AuditId === 0 ? null : <span> {props.AuditId} </span>
                }
                sortComparer={this.numericSorter}
              />
              <ColumnDirective
                field="AdditionalAuditIds"
                headerText="Additional Audit Ids"
                width="150"
                type="string"
                textAlign="Center" 
              />
              <ColumnDirective
                field="Channels"
                headerText="Channel"
                width="100"
                type="string"
                textAlign="Center" 
              />
              <ColumnDirective
                field="RequestedAt"
                headerText="Request Date"
                width="110"
                sortComparer={this.dateSortComparer}
                visible={this.props.CurrentScreen == ScreenType.Grid}
              />
              <ColumnDirective
                field="RequestTypeName"
                headerText="Request Type"
                width="150"
                type="string"
                visible={this.props.CurrentScreen == ScreenType.Grid}
              />
              <ColumnDirective
                field="CallerName"
                headerText="User / Caller Name"
                width="150"
                type="string"
                visible={this.props.CurrentScreen == ScreenType.Grid}
              />
              <ColumnDirective
                field="AttendedBy"
                headerText="Inbound Request Recipient"
                width="150"
                type="string"
              />
              <ColumnDirective
                field="StatusName"
                headerText="Status"
                width="100"
                type="string"
                textAlign="Center"
                template={(props) => (
                  <span
                    className={`${
                      props.StatusCode === "NEW"
                        ? "statusNew"
                        : props.StatusCode === "UNRESOLVED"
                        ? "statusWIP"
                        : (props.StatusCode === "REOPENED" ? "statusReopen" : "statusRes")
                    } status-width`}
                  >
                    {props.StatusName}{" "}
                  </span>
                )}
              />
            </ColumnsDirective>
            <Inject
              services={[
                Sort,
                Filter,
                Toolbar,
                Edit,
                VirtualScroll,
                Reorder,
                Resize,
                ExcelExport,
              ]}
            />
          </GridComponent>
        </div>
      </div>
    );
  }
}

export default Grid;
