import MetaTitle from './MetaTitle';
import PropTypes from 'prop-types';
import React from 'react';

export default function Error({ status }) {
	let message = 'Error loading data. Please try again later.';
	if (status === 404) {
		message = 'This page does not exist.';
	}
	return (
		<>
			<MetaTitle title="Error" />
			<p>{message}</p>
		</>
	);
}

Error.propTypes = {
	status: PropTypes.number.isRequired,
};
