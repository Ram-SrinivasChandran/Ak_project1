import {
  CheckBoxSelection,
  MultiSelectComponent,
  Inject,
  DropDownListComponent,
} from "@syncfusion/ej2-react-dropdowns";
import React, { Component, useEffect, useRef } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { SetErrorClass, SetErrorTitle } from "../../Common/Actions/FieldData";
import { ActionTypes, FieldNames, ScreenType } from "../Store/Constants";
import { gridActionHandler } from "@syncfusion/ej2-react-grids";

function FilterRow(grid) {
  const prevGridDataLoadingId = useRef(null);

  //COMPONENTDIDUPDATE
  useEffect(() => {
    if (GridDataLoadingId.current !== prevGridDataLoadingId) {
      onSearchClick();
    }

    prevGridDataLoadingId = GridDataLoadingId.current;
  });

  const onSearchClick = () => {
    grid.loadSearchData(SearchParameters, dispatch);
  };

  const onExportClick = () => {
    actions.initServerCall(ActionTypes.EXPORT);
  };

  const {
    MasterData,
    Toast,
    SearchParameters,
    GridDataLoadingId,
    IsReadOnlyMode,
  } = useSelector((state) => {
    return {
      MasterData: state.MasterData,
      Toast: state.Toast,
      SearchParameters: state.SearchParameters,
      GridDataLoadingId: state.GridDataLoadingId,
      IsReadOnlyMode: state.IsReadOnlyMode,
    };
  });

  const dispatch = useDispatch();

  const actions = {
    updateScreenState: (screen) => {
      dispatch({ type: ActionTypes.UPDATE_SCREENSTATE, screen });
    },
    updateSearchFieldsValue: (field, data) =>
      dispatch({
        type: ActionTypes.UPDATE_SEARCH_FIELDVALUE,
        payload: { field: field, data: data },
      }),
    initServerCall: (action) =>
      dispatch({
        type: ActionTypes.INIT_SERVERCALL,
        payload: { action: action },
      }),
  };

  return (
    <>
      <div className="container-fluid pad-LR-0" id="filter_row">
        {!IsReadOnlyMode ? (
          <div className="row">
            <div className="col-md-12">
              <div className="searchBar">
                <div className="col-md-1">
                  <div className="form-group">
                    <label>Request Date: From</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      className={SetErrorClass(
                        SearchParameters.FromDate,
                        "pr-5 form-control intxt"
                      )}
                      title={SetErrorTitle(SearchParameters.FromDate)}
                      value={SearchParameters.FromDate.Value}
                      onChange={(e) =>
                        actions.updateSearchFieldsValue(
                          FieldNames.FromDate,
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-md-1">
                  <div className="form-group">
                    <label>To</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      className={SetErrorClass(
                        SearchParameters.ToDate,
                        "pr-5 form-control intxt"
                      )}
                      title={SetErrorTitle(SearchParameters.ToDate)}
                      value={SearchParameters.ToDate.Value}
                      onChange={(e) =>
                        actions.updateSearchFieldsValue(
                          FieldNames.ToDate,
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-md-1">
                  <div className="form-group">
                    <label>Status</label>
                    <div
                      style={{
                        display: "inline-block",
                        width: "145px",
                        height: "32px",
                      }}
                    >
                      <MultiSelectComponent
                        dataSource={MasterData.Statuses}
                        fields={{ text: "Name", value: "Id" }}
                        value={SearchParameters.StatusIds}
                        mode="CheckBox"
                        allowFiltering={false}
                        showSelectAll={true}
                        showDropDownIcon={true}
                        popupHeight="350px"
                        select={(e) => {
                          actions.updateSearchFieldsValue(
                            FieldNames.AddStatus,
                            e.itemData
                          );
                        }}
                        enableSelectionOrder={false}
                        removed={(e) => {
                          actions.updateSearchFieldsValue(
                            FieldNames.RemoveStatus,
                            e.itemData
                          );
                        }}
                      >
                        <Inject services={[CheckBoxSelection]} />
                      </MultiSelectComponent>
                    </div>
                  </div>
                </div>
                <div className="col-md-1">
                  <div className="form-group">
                    <label>Channel</label>
                    <div
                      style={{
                        display: "inline-block",
                        width: "145px",
                        height: "32px",
                      }}
                    >
                      <MultiSelectComponent
                        dataSource={MasterData.ChannelTypes}
                        fields={{ text: "Name", value: "Code" }}
                        value={SearchParameters.Channels}
                        mode="CheckBox"
                        allowFiltering={false}
                        showSelectAll={true}
                        showDropDownIcon={true}
                        popupHeight="350px"
                        select={(e) => {
                          actions.updateSearchFieldsValue(
                            FieldNames.AddChannel,
                            e.itemData
                          );
                        }}
                        enableSelectionOrder={false}
                        removed={(e) => {
                          actions.updateSearchFieldsValue(
                            FieldNames.RemoveChannel,
                            e.itemData
                          );
                        }}
                        placeholder={"Select"}
                      >
                        <Inject services={[CheckBoxSelection]} />
                      </MultiSelectComponent>
                    </div>
                  </div>
                </div>
                <div className="col-md-1">
                  <div className="form-group" id="client-search-panel">
                    <label>Client</label>
                    <div
                      style={{
                        display: "inline-block",
                        width: "145px",
                        height: "32px",
                      }}
                    >
                      <DropDownListComponent
                        dataSource={MasterData?.Clients}
                        filterType="Contains"
                        allowFiltering={true}
                        filterBarPlaceholder={"Search"}
                        fields={{
                          text: "Name",
                          value: "Id",
                        }}
                        showClearButton={true}
                        value={SearchParameters.Client.Value}
                        placeholder={"Select"}
                        change={(e) => {
                          if (e.isInteracted) {
                            actions.updateSearchFieldsValue(
                              FieldNames.SearchClient,
                              e.value
                            );
                          }
                        }}
                        popupWidth={"auto"}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-1 audit_section">
                  <div className="form-group">
                    <label>Audit Id(s)</label>
                    <input
                      type="text"
                      className={SetErrorClass(
                        SearchParameters.AuditIds,
                        "pr-5 form-control intxt"
                      )}
                      title={SetErrorTitle(SearchParameters.AuditIds)}
                      value={SearchParameters.AuditIds.Value}
                      onChange={(e) =>
                        actions.updateSearchFieldsValue(
                          FieldNames.SearchAuditIds,
                          e.target.value
                        )
                      }
                      onBlur={(e) =>
                        actions.updateSearchFieldsValue(
                          FieldNames.SearchAuditIds_OnBlur,
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-md-2 btnContainer">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={SearchParameters.SearchPanelHasError}
                    onClick={onSearchClick}
                  >
                    <span className="glyphicon glyphicon-search icstyle"></span>{" "}
                    Search
                  </button>{" "}
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={SearchParameters.SearchPanelHasError}
                    onClick={onExportClick}
                  >
                    <span className="glyphicon glyphicon-share icstyle"></span>{" "}
                    Export
                  </button>
                </div>
                <div className="col-md-1 btnContainerAddNew">
                  <a href="#">
                    <span
                      id="btn_addDetails"
                      onClick={() =>
                        actions.updateScreenState(ScreenType.AddForm)
                      }
                    >
                      <img src="/content/images/Add.png" alt="" /> Add New
                      Request
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-12">
              <div className="searchBar">
                <div className="col-md-2">
                  <div className="form-group">
                    <label>Client</label>
                    <input
                      type="text"
                      className="form-control"
                      disabled={true}
                      title={SearchParameters.ClientName}
                      value={SearchParameters.ClientName}
                    />
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="form-group">
                    <label>AuditId(s)</label>
                    <input
                      type="text"
                      className="form-control"
                      disabled={true}
                      title={SearchParameters.AuditIds.Value}
                      value={SearchParameters.AuditIds.Value}
                    />
                  </div>
                </div>
                <div className="btnContainerAddNew">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={SearchParameters.SearchPanelHasError}
                    onClick={onExportClick}
                  >
                    <span className="glyphicon glyphicon-share icstyle"></span>{" "}
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FilterRow;
