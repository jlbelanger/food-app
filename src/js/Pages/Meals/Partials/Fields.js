import { Field } from '@jlbelanger/formosa';
import PropTypes from 'prop-types';
import React from 'react';

export default function Fields({ row = null }) {
	return (
		<div className="formosa-responsive">
			<Field label="Name" name="name" required />
			{!row.id && (
				<Field
					label="Add to favourites"
					name="is_favourite"
					type="checkbox"
				/>
			)}
		</div>
	);
}

Fields.propTypes = {
	row: PropTypes.object,
};
