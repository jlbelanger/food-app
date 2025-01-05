import { colorsLight } from '../Utilities/Colors';
import PropTypes from 'prop-types';
import { React } from 'react';

export default function TrackableBody({ food, servingSize, trackables = [] }) {
	return (
		<td className="center column--trackables">
			<div className="trackable-list">
				{trackables.map((trackable, i) => {
					const val = Math.round((food[trackable.slug] / food.serving_size) * parseFloat(servingSize));
					let text = '';
					if (food[trackable.slug] !== null && !Number.isNaN(val)) {
						text = `${val.toLocaleString()} ${trackable.units || ''}`.trim();
					}
					return (
						<span
							aria-label={trackable.name}
							className={`trackable-item column--${trackable.slug}`}
							key={trackable.id}
							style={{ backgroundColor: colorsLight[i + 1] }}
						>
							{text}
						</span>
					);
				})}
			</div>
		</td>
	);
}

TrackableBody.propTypes = {
	food: PropTypes.object.isRequired,
	servingSize: PropTypes.number.isRequired,
	trackables: PropTypes.array,
};
