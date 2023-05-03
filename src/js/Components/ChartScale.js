import React, { useState } from 'react';
import { Field } from '@jlbelanger/formosa';
import PropTypes from 'prop-types';

export default function ChartScale({ chartRefs }) {
	const [scale, setScale] = useState('Month');
	const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

	chartRefs.forEach((chartRef) => {
		const chart = chartRef.current;
		if (chart) {
			const max = chart.config._config.options.plugins.zoom.limits.x.max; // eslint-disable-line no-underscore-dangle
			let min = chart.config._config.options.plugins.zoom.limits.x.min; // eslint-disable-line no-underscore-dangle
			if (scale === 'Month') {
				min = max - (oneDayInMilliseconds * 30);
				chart.options.scales.x.time.unit = 'day';
			} else if (scale === 'Year') {
				min = max - (oneDayInMilliseconds * 365);
				chart.options.scales.x.time.unit = 'month';
			} else {
				chart.options.scales.x.time.unit = 'month';
			}
			chart.zoomScale('x', { min, max });
		}
	});

	return (
		<Field
			fieldsetClassName="formosa-radio--inline"
			itemLabelClassName="formosa-button button--small button--header"
			label="Scale:"
			name="radio"
			type="radio"
			options={['Month', 'Year', 'All']}
			value={scale}
			setValue={setScale}
		/>
	);
}

ChartScale.propTypes = {
	chartRefs: PropTypes.array.isRequired,
};
