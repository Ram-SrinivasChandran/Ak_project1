import React, { useEffect, useRef, useState } from "react";
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
  FilterSettings,
  gridHeader,
} from "@syncfusion/ej2-react-grids";
import "../../Common/css/SyncfusionGridCustom.css";
import axios from "axios";
import { ActionTypes, ScreenType } from "../Store/Constants";
import {
  GetFormattedFileName,
  GetFormattedDateTime,
} from "../../Common/Actions/DateHandler";

function Grid({grid, onRowSelected, rowData, CurrentScreen, filterSettings, Id}) {
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 345)
  const [gridData, setGridData] = useState([]);
  const prevCurrentScreenRef = useRef(null);
  const gridRef = useRef(null);

  if (window.RequestData.GridData && window.RequestData.GridData.length) {
    setGridData(window.RequestData.GridData);
    setDateFormat(window.RequestData.GridData);
  }

  FilterSettings = {
    //showFilterBarOperator : true,
    immediateModeDelay: 300,
    mode: "Immediate", // to show search result immidiately
  }

  const setDateFormat = (gridData) => {
    gridData.map((d) => {
      d.RequestedAt
        = d.RequestedAt ? GetFormattedDateTime(new Date(d.RequestedAt)) : "";
    });
  }

  const loadSearchData = (searchParam, dispatch) => {
    let apiRootUrl = window.ApiRootUrl ? window.ApiRootUrl : "";
    let urlString = `${apiRootUrl}/ProviderRequest/GetProviderRequests`;

    if (window.IsConnected === true) {
      updateSearchStatus(dispatch, true);
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
            setDateFormat(response.data);
            setGridData( response.data );
            updateSearchStatus(dispatch, false, response.data.length);
          } else {
            //For custom error page
            handleSearchError(response, dispatch);
          }
        },
        (e) => {
          handleSearchError(e, dispatch);
        }
      );
    }
  }
  const exportData = () => {
    if(grid && grid.columns[0]){
      for(let i =0; i<grid.columns.length; i++){
        grid.columns[i].previousVisible = this.grid.columns[i].visible;
        grid.columns[i].visible =true;
      
      }
      grid.columns[0].visible = false; //To hide action column while export
    }
    var date = new Date();
    let excelExportProperties = {
      fileName: GetFormattedFileName("ProviderRequestNew_", ".xlsx"),
    };

    grid.excelExport(excelExportProperties);
  }

  const excelExportComplete = () =>  {
    if (grid && grid.columns[0]) {
      for (let i = 0; i < grid.columns.length; i++) {
        grid.columns[i].visible = grid.columns[i].previousVisible;
      }
    }
  }

  const updateSearchStatus = (dispatch, isSearchInProgress, resultCount = null) => {
    dispatch({
      type: ActionTypes.UPDATES_SEARCHSTATUS,
      payload: { isSearchInProgress, resultCount },
    }); //dispatch grid data
  }

  const handleSearchError = (e, dispatch) => {
    window.alert("System failed to fetch data. Please contact support team.");
    window.console.error(e);
    updateSearchStatus(dispatch, false);
  }

  const updateGridHeight = () => {
    setGridHeight( window.innerHeight - 345);
  }

  //COMPONENTDIDMOUNT()
  useEffect(()=> {
    window.addEventListener("resize", updateGridHeight());
  })

  //COMPONENTDIDUPDATE()
  
  useEffect((props)=>{
    if(props.CurrentScreen.current !== prevCurrentScreenRef){
      grid.refresh();
    }
    prevCurrentScreenRef = props.CurrentScreen.current;
  })

  useEffect(()=>{
    window.removeEventListener("resize", updateGridHeight());
  })

  const databound = () => {
    if (grid) {
      //this.grid.columns=GridColumns;
      /*free search with contains is allowed on string type columns as per ej2*/
      grid.getColumns().filter((column) => {
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
  const recordDoubleClick = () => {
    if (onRowSelected) onRowSelected(rowData.Id);
  }

 /** Custom comparer function */
 const dateSortComparer = (reference, comparer) => {
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

const numericSorter = (reference, comparer) => {
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

return(<>
    <div
        className="tblht"
        style={{
          width:
            CurrentScreen == ScreenType.Grid
              ? "100%"
              : CurrentScreen == ScreenType.AddForm ||
                CurrentScreen == ScreenType.EditForm
              ? "37.5%"
              : CurrentScreen == ScreenType.GridWithCurrentRequests
              ? "55.5%"
              : "0",
        }}
      >
        <div className="grey-bg2 show" id="psq_main">
          <GridComponent
            dataSource={gridData}
            height={gridHeight}
            enableVirtualization={true}
            //enableImmutableMode={true}
            ref={gridRef}
            allowPaging={false}
            gridLines="Both"
            allowSorting={true}
            allowResizing={true}
            allowReordering={true}
            allowFiltering={true}
            allowExcelExport={true}
            filterSettings={filterSettings}
            dataBound={databound()}
            excelExportComplete={excelExportComplete()}
            recordDoubleClick={recordDoubleClick()}
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
                template={() => (
                  <span
                    className="glyphicon glyphicon-edit"
                    onClick={() => {
                      if (onRowSelected) {
                        onRowSelected(Id);
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
                sortComparer={numericSorter}
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
                sortComparer={numericSorter}
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
                sortComparer={dateSortComparer()}
                visible={CurrentScreen == ScreenType.Grid}
              />
              <ColumnDirective
                field="RequestTypeName"
                headerText="Request Type"
                width="150"
                type="string"
                visible={CurrentScreen == ScreenType.Grid}
              />
              <ColumnDirective
                field="CallerName"
                headerText="User / Caller Name"
                width="150"
                type="string"
                visible={CurrentScreen == ScreenType.Grid}
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
</>)




}

export default Grid;
