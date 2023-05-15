import Auth from './Utilities/Auth';
import MetaTitle from './Components/MetaTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';

export default function Error({ error }) {
	const history = useHistory();

	if (error.status === 401) {
		Auth.logout(history);
		return null;
	}

	let message = 'Error loading data. Please try again later.';
	if (error.errors[0].title) {
		message = error.errors[0].title;
	}
	return (
		<>
			<MetaTitle title="Error" />
			<p>{message}</p>
		</>
	);
}

Error.propTypes = {
	error: PropTypes.object.isRequired,
};
