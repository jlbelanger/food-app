import { Api, FormosaContext, Input } from '@jlbelanger/formosa';
import { filterByKeys, sortByKey } from '../../Utilities/Table';
import React, { useContext, useEffect, useState } from 'react';
import { ReactComponent as ArrowIcon } from '../../../svg/arrow.svg';
import Auth from '../../Utilities/Auth';
import Error from '../../Error';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import { Link } from 'react-router-dom';
import MetaTitle from '../../MetaTitle';
import TrackableBody from '../../TrackableBody';

export default function List() {
	const { formosaState } = useContext(FormosaContext);
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
			.then((response) => {
				setRows(response);
				setFilteredRows(response);
				setIsLoading(false);
			})
			.catch((response) => {
				setError(response.status);
				setIsLoading(false);
			});
		Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`, false)
			.then((response) => {
				setTrackables(response);
			});
		return () => {};
	}, []);

	if (error) {
		return (
			<Error status={error} />
		);
	}

	const totalFiltered = filteredRows.length;
	const total = rows ? rows.length : 0;

	const favourite = (e) => {
		const id = e.target.getAttribute('data-id');
		Api.post(`food/${id}/favourite`)
			.then(() => {
				const newRows = [...rows];
				const i = newRows.findIndex((row) => (row.id === id));
				if (i > -1) {
					newRows[i].is_favourite = !newRows[i].is_favourite;
					setRows(newRows);
					formosaState.addToast(`Food ${newRows[i].is_favourite ? '' : 'un'}favourited successfully.`, 'success');
				} else {
					formosaState.addToast('Error.', 'error');
				}
			})
			.catch((response) => {
				const text = response.message ? response.message : response.errors.map((err) => (err.title)).join(' ');
				formosaState.addToast(text, 'error', 10000);
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
				<Link className="formosa-button" to="/food/new">Add</Link>
			</MetaTitle>

			<div id="search-container">
				<label className="formosa-label" htmlFor="search">Search</label>
				<Input disabled={isLoading} id="search" setValue={search} type="search" value={searchValue} />
			</div>

			<table>
				<thead>
					<tr>
						<th className="column--button">{tableButton('is_favourite', '')}</th>
						<th>{tableButton('slug', 'Name')}</th>
						<th className="column--size">{tableButton('serving_size', 'Size')}</th>
						<th className="column--units">{tableButton('serving_units', 'Units')}</th>
						{trackables.map((trackable) => (
							<th key={trackable.id}>{tableButton(trackable.slug, trackable.name)}</th>
						))}
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
										className={`heart ${row.is_favourite ? 'un' : ''}favourite`}
										data-id={row.id}
										onClick={favourite}
										type="button"
									>
										<HeartIcon alt={row.is_favourite ? 'Unfavourite' : 'Favourite'} height={16} width={16} />
									</button>
								</td>
								<td><Link className="table-link" to={`/food/${row.id}`}>{row.name}</Link></td>
								<td className="column--size">{row.serving_size}</td>
								<td className="column--units">{row.serving_units}</td>
								<TrackableBody food={row} servingSize={row.serving_size} trackables={trackables} />
							</tr>
						))}
				</tbody>
			</table>
		</>
	);
}
