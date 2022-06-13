import { colorsLight } from './Utilities/Colors';
import PropTypes from 'prop-types';
import { React } from 'react';

export default function TrackableBody({ food, servingSize, trackables }) {
	return trackables.map((trackable, i) => {
		let val = (food[trackable.slug] / food.serving_size) * servingSize;
		val = parseInt(val, 10);
		return (
			<td className="center" key={trackable.id} style={{ backgroundColor: colorsLight[i + 1] }}>
				{food[trackable.slug] !== null && !Number.isNaN(val) ? (
					`${val.toLocaleString()} ${trackable.units || ''}`.trim()
				) : ''}
			</td>
		);
	});
}

TrackableBody.propTypes = {
	food: PropTypes.object.isRequired,
	servingSize: PropTypes.number.isRequired,
	trackables: PropTypes.array,
};

TrackableBody.defaultProps = {
	trackables: [],
};
