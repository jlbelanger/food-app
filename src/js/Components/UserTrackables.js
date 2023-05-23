import { Alert, Api, Field, FormAlert, Submit } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import { errorMessageText } from '../Utilities/Helpers';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserTrackables({ user }) {
	const [row, setRow] = useState(user);
	const [trackablesError, setTrackablesError] = useState(false);
	const [allTrackables, setAllTrackables] = useState([]);

	useEffect(() => {
		Api.get('trackables?fields[trackables]=name,slug&sort=slug')
			.catch((response) => {
				setTrackablesError(errorMessageText(response));
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setAllTrackables(response);
			});
	}, []);

	if (trackablesError) {
		return (
			<Alert type="error">Error getting trackables.</Alert>
		);
	}

	const checkAll = () => {
		setRow({ ...row, trackables: [...allTrackables] });
	};

	const uncheckAll = () => {
		setRow({ ...row, trackables: [] });
	};

	const afterSubmitSuccess = () => {
		Auth.setTrackables(row.trackables.sort((a, b) => (a.id > b.id)));
	};

	return (
		<MyForm
			afterSubmitSuccess={afterSubmitSuccess}
			afterNoSubmit={afterSubmitSuccess}
			errorMessageText={errorMessageText}
			id={row.id}
			method="PUT"
			path="users"
			preventEmptyRequest
			relationshipNames={['trackables']}
			row={row}
			setRow={setRow}
			showMessage={false}
			successToastText="Tracking settings updated successfully."
		>
			<h2 className="flex">
				<span style={{ alignSelf: 'center', flex: '1 1 auto' }}>Tracking</span>
				<button className="formosa-button button--small button--secondary" onClick={checkAll} type="button">Check All</button>
				<button className="formosa-button button--small button--secondary" onClick={uncheckAll} type="button">Uncheck All</button>
			</h2>

			<FormAlert />

			<Field
				name="trackables"
				fieldsetClassName="radio-list"
				inputAttributes={(option) => ({ id: `trackable-${option.slug}` })}
				options={allTrackables}
				type="checkbox-list"
			/>

			<Submit id="save-tracking" label="Save" />
		</MyForm>
	);
}

UserTrackables.propTypes = {
	user: PropTypes.object.isRequired,
};
