import { colors, colorsLight } from '../Utilities/Colors';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Api } from '@jlbelanger/formosa';
import Auth from '../Utilities/Auth';
import { ReactComponent as ChevronIcon } from '../../svg/chevron.svg';
import Error from '../Error';
import { mapTrackables } from '../Utilities/Helpers';
import MetaTitle from '../Components/MetaTitle';

export default function Calendar() {
	const api = Api.instance();
	const history = useHistory();
	const thisYear = (new Date()).getFullYear();
	const urlSearchParams = new URLSearchParams(history.location.search);
	const currentYear = parseInt(urlSearchParams.get('year') || thisYear, 10);

	const [months, setMonths] = useState([]);
	const [error, setError] = useState(false);
	const [trackables, setTrackables] = useState([]);

	const getEntries = (date) => {
		if (!date) {
			return;
		}

		api(`calendar/${date}`)
			.catch((response) => {
				setError(response);
			})
			.then((response) => {
				if (!response) {
					return;
				}
				setMonths(response);
			});
	};

	useEffect(() => {
		if (Auth.hasTrackables()) {
			api(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
				.then((response) => {
					setTrackables(mapTrackables(response));
				});
		}

		getEntries(currentYear);
	}, []);

	if (error) {
		return (
			<Error error={error} />
		);
	}

	const prettyMonth = (ym) => (
		new Date(`${ym}-01T12:00:00Z`).toLocaleString('en-CA', {
			year: 'numeric',
			month: 'long',
		})
	);

	const prettyDay = (date) => (parseInt(date.substr(8, 2), 10));

	const changeYear = (modifier = 1) => {
		const newYear = currentYear + modifier;
		urlSearchParams.set('year', newYear);
		history.replace({ search: urlSearchParams.toString() });
		return newYear;
	};

	const previousYear = () => {
		getEntries(changeYear(-1));
	};

	const nextYear = () => {
		getEntries(changeYear(1));
	};

	const withUnits = (value, units) => (
		value !== null ? `${value.toLocaleString()} ${units || ''}`.trim() : ''
	);

	const calculateWeekAverage = (week, key, units) => {
		if (!week) {
			return 0;
		}

		const num = week.length;
		let total = 0;
		let i;
		let count = 0;

		for (i = 0; i < num; i += 1) {
			if (week[i].trackables && Object.prototype.hasOwnProperty.call(week[i].trackables, key) && week[i].trackables[key]) {
				total += week[i].trackables[key];
				count += 1;
			}
		}

		count = count ? Math.round(total / count) : null;

		return withUnits(count, units);
	};

	return (
		<>
			<MetaTitle
				before={(
					<button className="button--icon" id="previous" onClick={previousYear} type="button">
						Previous Year
						<ChevronIcon height={16} width={16} />
					</button>
				)}
				title={currentYear.toString() || 'Calendar'}
			>
				<button className="button--icon" disabled={currentYear === thisYear} id="next" onClick={nextYear} type="button">
					Next Year
					<ChevronIcon height={16} width={16} />
				</button>
			</MetaTitle>

			<ul className="calendar__legend">
				<li className="calendar__legend__item" style={{ backgroundColor: colors[0] }}>
					Weight
				</li>
				{trackables.map((trackable, i) => (
					<li className="calendar__legend__item" key={trackable.id} style={{ backgroundColor: colors[i + 1] }}>
						{trackable.name}
					</li>
				))}
			</ul>

			<div className="calendar__legend-spacer" />

			{months.map((month) => (
				<table className={`calendar${!month.data ? ' calendar--hide' : ''}`} key={month.month}>
					<caption className="calendar__caption">{prettyMonth(month.month)}</caption>
					<thead>
						<tr>
							<th className="calendar__th" aria-label="Sunday" scope="col">S</th>
							<th className="calendar__th" aria-label="Monday" scope="col">M</th>
							<th className="calendar__th" aria-label="Tuesday" scope="col">T</th>
							<th className="calendar__th" aria-label="Wednesday" scope="col">W</th>
							<th className="calendar__th" aria-label="Thursday" scope="col">T</th>
							<th className="calendar__th" aria-label="Friday" scope="col">F</th>
							<th className="calendar__th" aria-label="Saturday" scope="col">S</th>
							<th className="calendar__th calendar__th--avg" />
						</tr>
					</thead>
					<tbody>
						{month.weeks.map((week) => (
							<tr key={`${month.month}-${week.week}`}>
								{week.days.map((day) => (
									<td className="calendar__day" key={day.date || day.i}>
										{day.date && (
											<>
												{day.trackables ? (
													<Link className="calendar__link" to={`/?date=${day.date}`}>{prettyDay(day.date)}</Link>
												) : (
													<span>{prettyDay(day.date)}</span>
												)}
												{day.trackables && (
													<div className="calendar__item" style={{ backgroundColor: colors[0] }}>
														{day.trackables.weight ? `${day.trackables.weight} ${Auth.weightUnits()}` : '-'}
													</div>
												)}
												{trackables.map((trackable, i) => {
													if (!day.trackables) {
														return null;
													}
													let val = '-';
													if (day.trackables[trackable.slug]) {
														val = withUnits(day.trackables[trackable.slug], trackable.units);
													}
													return (
														<div className="calendar__item" key={trackable.id} style={{ backgroundColor: colors[i + 1] }}>
															{val}
														</div>
													);
												})}
											</>
										)}
									</td>
								))}
								<td className={`calendar__day${week.data ? ' calendar__day--avg' : ''}`}>
									{week.data && (
										<>
											<div className="calendar__item" style={{ backgroundColor: colorsLight[0] }}>
												{calculateWeekAverage(week.days, 'weight', Auth.weightUnits()) || '-'}
											</div>
											{trackables.map((trackable, i) => (
												<div className="calendar__item" key={trackable.slug} style={{ backgroundColor: colorsLight[i + 1] }}>
													{calculateWeekAverage(week.days, trackable.slug, trackable.units) || '-'}
												</div>
											))}
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			))}
		</>
	);
}
