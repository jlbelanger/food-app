import { Api, FormosaContext } from '@jlbelanger/formosa';
import { filterByKeys, sortByKey } from '../../Utilities/Table';
import React, { useContext, useEffect, useState } from 'react';
import { ReactComponent as ArrowIcon } from '../../../svg/arrow.svg';
import Auth from '../../Utilities/Auth';
import { colorsLight } from '../../Utilities/Colors';
import Error from '../../Error';
import { ReactComponent as HeartIcon } from '../../../svg/heart.svg';
import { Link } from 'react-router-dom';
import MetaTitle from '../../MetaTitle';
import { ReactComponent as SearchIcon } from '../../../svg/search.svg';

export default function List() {
	const { formosaState } = useContext(FormosaContext);
	const [sortKey, setSortKey] = useState('slug');
	const [sortDir, setSortDir] = useState('asc');
	const [searchValue, setSearchValue] = useState('');
	const [rows, setRows] = useState(null);
	const [filteredRows, setFilteredRows] = useState([]);
	const [trackables, setTrackables] = useState(null);
	const [error, setError] = useState(false);
	useEffect(() => {
		const foodFields = Auth.trackables().concat(['is_favourite,is_verified,name,serving_size,serving_units,slug']);
		Api.get(`food?fields[food]=${foodFields.join(',')}&sort=slug`)
			.then((response) => {
				setRows(response);
				setFilteredRows(response);
			})
			.catch((response) => {
				setError(response.status);
			});
		Api.get(`trackables?fields[trackables]=name,slug,units&filter[slug][in]=${Auth.trackables().join(',')}`)
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

	if (rows === null) {
		return null;
	}

	const totalFiltered = filteredRows.length;
	const total = rows.length;

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

	const search = (e) => {
		setSearchValue(e.target.value);

		const newRows = filterByKeys(rows, { name: e.target.value });
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

			<p id="search-container">
				<label className="formosa-label" htmlFor="search">Search</label>
				<input className="formosa-field__input" id="search" onChange={search} type="search" value={searchValue || ''} />
				<SearchIcon />
			</p>

			<table>
				<thead>
					<tr>
						<th className="column--fave">{tableButton('is_favourite', '')}</th>
						<th>{tableButton('slug', 'Name')}</th>
						<th className="column--size">{tableButton('serving_size', 'Size')}</th>
						<th className="column--units">{tableButton('serving_units', 'Units')}</th>
						{trackables.map((trackable) => (
							<th key={trackable.id}>{tableButton(trackable.slug, trackable.name)}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{filteredRows.map((row) => (
						<tr key={row.id}>
							<td className="column--fave">
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
							{trackables.map((trackable, i) => (
								<td className="center" key={trackable.id} style={{ backgroundColor: colorsLight[i + 1] }}>
									{row[trackable.slug] !== null ? `${row[trackable.slug].toLocaleString()} ${trackable.units || ''}` : ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}
