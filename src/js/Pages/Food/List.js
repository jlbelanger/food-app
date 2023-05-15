import { Api, FormosaContext, Input } from '@jlbelanger/formosa';
import { filterByKeys, sortByKey } from '../../Utilities/Table';
import React, { useContext, useEffect, useState } from 'react';
import { ReactComponent as ArrowIcon } from '../../../svg/arrow.svg';
import Auth from '../../Utilities/Auth';
import { colorsLight } from '../../Utilities/Colors';
import Error from '../../Error';
import FoodLink from '../../Components/FoodLink';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import { Link } from 'react-router-dom';
import { mapTrackables } from '../../Utilities/Helpers';
import MetaTitle from '../../Components/MetaTitle';
import TrackableBody from '../../Components/TrackableBody';

export default function List() {
	const { addToast } = useContext(FormosaContext);
	const [sortKey, setSortKey] = useState('slug');
	const [sortDir, setSortDir] = useState('asc');
	const [searchValue, setSearchValue] = useState('');
	const [rows, setRows] = useState(null);
	const [filteredRows, setFilteredRows] = useState([]);
	const [trackables, setTrackables] = useState([]);
	const [error, setError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const foodFields = ['is_favourite', 'is_verified', 'name', 'serving_size', 'serving_units', 'slug'].concat(Auth.trackables());
		Api.get(`food?fields[food]=${foodFields.join(',')}&sort=slug`, false)
			.catch((response) => {
				setError(response);
				setIsLoading(false);
				throw response;
			})
			.then((response) => {
				setRows(response);
				setFilteredRows(response);
				setIsLoading(false);
			});
		if (Auth.hasTrackables()) {
			Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`, false)
				.then((response) => {
					setTrackables(mapTrackables(response));
				});
		}
	}, []);

	if (error) {
		return (
			<Error error={error} />
		);
	}

	const totalFiltered = filteredRows.length;
	const total = rows ? rows.length : 0;

	const favourite = (e) => {
		const id = e.target.getAttribute('data-id');
		Api.post(`food/${id}/favourite`)
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				addToast(text, 'error', 10000);
				throw response;
			})
			.then(() => {
				const newRows = [...rows];
				const i = newRows.findIndex((row) => (row.id === id));
				if (i > -1) {
					newRows[i].is_favourite = !newRows[i].is_favourite;
					setRows(newRows);
					addToast(`Food ${newRows[i].is_favourite ? '' : 'un'}favourited successfully.`, 'success');
				} else {
					addToast('Error.', 'error');
				}
			});
	};

	const search = (value) => {
		setSearchValue(value);

		const newRows = filterByKeys(rows, { name: value });
		setFilteredRows(newRows);
	};

	const sort = (e) => {
		const newKey = e.target.getAttribute('data-key');
		let newDir;

		if (sortKey === newKey) {
			newDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			newDir = 'asc';
		}

		setSortDir(newDir);
		setSortKey(newKey);
		setRows(sortByKey(rows, newKey, newDir));
		setFilteredRows(sortByKey(filteredRows, newKey, newDir));
	};

	const tableButton = (key, label) => (
		<button
			className="table-button"
			data-key={key}
			disabled={isLoading}
			onClick={sort}
			type="button"
		>
			{label}
			<ArrowIcon className={`caret${sortDir === 'asc' ? '' : ' flip'}${sortKey === key ? '' : ' hide'}`} height={12} width={12} />
		</button>
	);

	return (
		<>
			<MetaTitle
				title="Food"
				small={`(${total !== totalFiltered ? `${totalFiltered.toLocaleString()} of ` : ''}${total.toLocaleString()} results)`}
			>
				<Link className="formosa-button button--small" to="/food/new">Add</Link>
			</MetaTitle>

			<div id="search-container">
				<label className="formosa-label" htmlFor="search">Search</label>
				<Input disabled={isLoading} id="search" setValue={search} type="search" value={searchValue} />
			</div>

			{(!isLoading && totalFiltered <= 0) ? (
				<p>No results found.</p>
			) : (
				<table className="responsive-table" id="food-list">
					<thead>
						<tr>
							<th aria-label="Actions" className="column--button" scope="col">{tableButton('is_favourite', '')}</th>
							<th className="column--name" scope="col">{tableButton('slug', 'Name')}</th>
							<th className="column--size" scope="col">{tableButton('serving_size', 'Size')}</th>
							<th className="column--units" scope="col">{tableButton('serving_units', 'Units')}</th>
							<th className="column--trackables" scope="col">
								<div className="trackable-list">
									{trackables.map((trackable, i) => (
										<span className="trackable-item" key={trackable.id} style={{ backgroundColor: colorsLight[i + 1] }}>
											{tableButton(trackable.slug, trackable.name)}
										</span>
									))}
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={4 + trackables.length}>
									<div className="formosa-spinner" style={{ justifyContent: 'center', margin: '16px auto' }}>Loading...</div>
								</td>
							</tr>
						)
							: filteredRows.map((row) => (
								<tr key={row.id}>
									<td className="column--button">
										<button
											aria-label={row.is_favourite ? 'Unfavourite' : 'Favourite'}
											className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
											data-id={row.id}
											onClick={favourite}
											type="button"
										>
											<HeartIcon aria-hidden height={16} width={16} />
										</button>
									</td>
									<td className="column--name">
										<FoodLink food={row} />
									</td>
									<td className="column--size">{row.serving_size}</td>
									<td className="column--units">{row.serving_units}</td>
									<TrackableBody food={row} servingSize={row.serving_size} trackables={trackables} />
								</tr>
							))}
					</tbody>
				</table>
			)}
		</>
	);
}
