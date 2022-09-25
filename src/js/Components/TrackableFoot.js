import { colorsLight } from '../Utilities/Colors';
import PropTypes from 'prop-types';
import { React } from 'react';

export default function TrackableFoot({ extras, rows, trackables }) {
	return (
		<th className="center column--trackables" scope="col">
			<div className="trackable-list">
				{trackables.map((trackable, i) => {
					let val = 0;
					rows.forEach((row) => {
						if (row.user_serving_size && !Number.isNaN(parseFloat(row.user_serving_size))) {
							val += Math.round((row.food[trackable.slug] / row.food.serving_size) * parseFloat(row.user_serving_size));
						}
					});
					extras.forEach((extra) => {
						if (extra[trackable.slug] && !Number.isNaN(parseFloat(extra[trackable.slug]))) {
							val += Math.round(parseFloat(extra[trackable.slug]));
						}
					});
					return (
						<span
							aria-label={`Total ${trackable.name}`}
							className={`trackable-item table-heading column-total--${trackable.slug}`}
							key={trackable.id}
							style={{ backgroundColor: colorsLight[i + 1] }}
						>
							{`${val.toLocaleString()} ${trackable.units || ''}`.trim()}
						</span>
					);
				})}
			</div>
		</th>
	);
}

TrackableFoot.propTypes = {
	extras: PropTypes.array,
	rows: PropTypes.array,
	trackables: PropTypes.array,
};

TrackableFoot.defaultProps = {
	extras: [],
	rows: [],
	trackables: [],
};
