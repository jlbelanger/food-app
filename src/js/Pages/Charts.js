import 'luxon';
import 'chartjs-adapter-luxon';
import {
	Chart as ChartJS,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	TimeScale,
	Tooltip,
} from 'chart.js';
import React, { createRef, useEffect, useMemo, useState } from 'react';
import { Api } from '@jlbelanger/formosa';
import Auth from '../Utilities/Auth';
import { Chart } from 'react-chartjs-2';
import ChartScale from '../Components/ChartScale';
import { colorsDark } from '../Utilities/Colors';
import Error from '../Error';
import MetaTitle from '../Components/MetaTitle';
import zoomPlugin from 'chartjs-plugin-zoom';

export default function Charts() {
	const chartSlugs = ['weight'].concat(Auth.trackables());
	const chartRefs = useMemo(() => (
		chartSlugs.map(() => createRef())
	), chartSlugs);
	const [datasets, setDatasets] = useState([]);
	const [error, setError] = useState(false);
	const [max] = useState((new Date()).getTime());
	const [min, setMin] = useState('original');

	const getEntries = () => {
		Api.get('charts')
			.then((response) => {
				const output = [];
				const names = Object.keys(response);
				let newMin = max;
				Object.values(response).forEach((dataset, i) => {
					const data = {
						labels: [],
						datasets: [
							{
								backgroundColor: colorsDark[i],
								borderColor: colorsDark[i],
								borderWidth: 2,
								borderCapStyle: 'round',
								fill: false,
								data: [],
							},
						],
					};
					let minY = null;
					let maxY = null;
					dataset.forEach((point, j) => {
						const date = new Date(`${point.x}T12:00:00.000Z`);
						data.labels.push(date);
						data.datasets[0].data.push(point.y);

						if (minY === null || point.y < minY) {
							minY = point.y;
						}
						if (maxY === null || point.y > maxY) {
							maxY = point.y;
						}

						const time = date.getTime();
						if (j === 0 && time < max) {
							newMin = time;
						}
					});
					const threshold = (maxY - minY) * 0.05;
					output.push({
						data,
						name: names[i],
						minY: Math.max(0, Math.floor(minY - threshold)),
						maxY: Math.ceil(maxY + threshold),
					});
				});
				setMin(newMin);
				setDatasets(output);
			})
			.catch((response) => {
				setError(response.status);
			});
	};

	useEffect(() => {
		window.HAS_ZOOMED = {};

		getEntries();

		const defaultZoomPlugin = {
			id: 'defaultzoom',
			beforeBuildTicks: (chart) => {
				if (window.HAS_ZOOMED[chart.id]) {
					return;
				}
				const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;
				window.HAS_ZOOMED[chart.id] = true;
				chart.zoomScale('x', { min: max - oneMonthInMilliseconds, max });
			},
		};
		ChartJS.register(LineController, LineElement, LinearScale, PointElement, TimeScale, Tooltip, zoomPlugin, defaultZoomPlugin);
	}, []);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	const graphOptions = (minY, maxY) => ({
		maintainAspectRatio: false,
		scales: {
			x: {
				type: 'time',
				time: {
					unit: 'day',
					tooltipFormat: 'MMM d, yyyy',
				},
				ticks: {
					maxRotation: 0,
					minRotation: 0,
				},
			},
			y: {
				min: minY,
				max: maxY,
				ticks: {
					precision: null,
				},
				type: 'linear',
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			zoom: {
				limits: {
					x: { min, max },
					y: { min: minY, max: maxY },
				},
				pan: {
					enabled: true,
					mode: 'x',
				},
				zoom: {
					mode: 'x',
					pinch: {
						enabled: true,
					},
					wheel: {
						enabled: false,
					},
				},
			},
		},
	});

	return (
		<>
			<MetaTitle title="Charts">
				<ChartScale chartRefs={chartRefs} />
			</MetaTitle>

			{datasets.map((dataset, i) => (
				<section className="chart" key={dataset.name}>
					<header className="chart-header">
						<h2 className="chart-title">{dataset.name}</h2>
					</header>
					<div className="chart-container">
						<Chart
							ref={chartRefs[i]}
							data={dataset.data}
							options={graphOptions(dataset.minY, dataset.maxY)}
							type="line"
						/>
					</div>
				</section>
			))}
		</>
	);
}
