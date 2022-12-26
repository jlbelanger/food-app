import { Api, Field, Message, Submit } from '@jlbelanger/formosa';
import React, { useEffect, useState } from 'react';
import Auth from '../Utilities/Auth';
import MyForm from './MyForm';
import PropTypes from 'prop-types';

export default function UserTrackables({ user }) {
	const [row, setRow] = useState(user);
	const [errorTrackables, setErrorTrackables] = useState(false);
	const [allTrackables, setAllTrackables] = useState([]);

	useEffect(() => {
		Api.get('trackables?fields[trackables]=name,slug&sort=slug')
			.then((response) => {
				setAllTrackables(response);
			})
			.catch((response) => {
				setErrorTrackables(response.status);
			});
	}, []);

	const checkAll = () => {
		setRow({ ...row, trackables: [...allTrackables] });
	};

	const uncheckAll = () => {
		setRow({ ...row, trackables: [] });
	};

	const afterSubmit = () => {
		Auth.setTrackables(row.trackables.sort((a, b) => (a.id > b.id)));
	};

	if (errorTrackables) {
		return (
			<p className="formosa-message formosa-message--error">Error getting trackables.</p>
		);
	}

	return (
		<MyForm
			afterSubmit={afterSubmit}
			afterNoSubmit={afterSubmit}
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
				<button className="formosa-button button--small button--tertiary" onClick={checkAll} type="button">Check All</button>
				<button className="formosa-button button--small button--tertiary" onClick={uncheckAll} type="button">Uncheck All</button>
			</h2>

			<Message />

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
