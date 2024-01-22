import React, { Component } from "react";
import { connect } from "react-redux";

import { Util } from "../../Common/Actions/Util";
import { Status } from "../Store/Constants";

class ContactChangeRequest extends Component {

	constructor() {
		super(...arguments);
		this.OpenProviderAddressManager = this.OpenProviderAddressManager.bind(this);
	}

	OpenProviderAddressManager() {
		var params = "/ProviderAddress/Show?";
		var windowName = 'EditProviderWindow';
		var strWindowFeatures = 'menubar=no,location=no,resizable=yes,scrollbars=no,status=yes';
		var isValidUrl = Util.sanitizeURL(params);
		if (!isValidUrl) {
			return false;
		} 
		
		window.open(encodeURI(params), windowName, strWindowFeatures);
	}

    render() {
		const { dispatch } = this.props;
		const queryDetail = this.props.queryDetail;
		const statusCode = this.props.statusCode;
		const requestDataJson = JSON.parse(queryDetail.RequestDataJson);

		return 	<div>	
			{requestDataJson !== null ? (
				<div className="col-md-12 pn5">
					<p className="serv-titlepsq">
						<strong>
							<img src="/content/images/address.png" alt="" width="16" /> 
							New Contact
						</strong>
						{(statusCode !== Status.RESOLVED && statusCode !== Status.AUTORESOLVED)&&
							<span className="prmLink" 
								onClick={this.OpenProviderAddressManager}>
								<a href="#"><img src="/content/images/editPRM.png" alt="" width="16" /> 
									Update in Provider Manager
								</a>
							</span>
						}
					</p>

					<div className="updateContactContainer">
						{Object.entries(requestDataJson.updatedContactDetails).map(([label, value]) => (
							value !== null && (
								<div key = {label}>
									<label style={{ 'fontWeight': 'bold', 'textTransform': 'capitalize'}}>
										{label} :
									</label>
									<span>{value}</span>
								</div>
							)
						))}
					</div>					
				</div>

				) :  null	
			}
		</div>	
    }
}

export default connect()(ContactChangeRequest);