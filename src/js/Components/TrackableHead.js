import PropTypes from 'prop-types';
import { React } from 'react';

export default function TrackableHead({ trackables }) {
	return trackables.map((trackable) => (
		<th className="column--trackable" key={trackable.id} scope="col" style={{ width: '90px' }}>
			<span className="table-heading">{trackable.name}</span>
		</th>
	));
}

TrackableHead.propTypes = {
	trackables: PropTypes.array,
};

TrackableHead.defaultProps = {
	trackables: [],
};
