import { Api, FormosaContext } from '@jlbelanger/formosa';
import React, { useContext } from 'react';
import Auth from './Utilities/Auth';
import { NavLink } from 'react-router-dom';

export default function Header() {
	const { formosaState } = useContext(FormosaContext);
	const logout = () => {
		Api.delete('auth/logout')
			.then(() => {
				Auth.logout();
			})
			.catch((response) => {
				if (response.status === 401 || response.status === 404) {
					Auth.logout();
					return;
				}
				formosaState.addToast('Error.', 'error');
			});
	};

	return (
		<header id="header">
			<div className="contain" id="header__contain">
				{Auth.isLoggedIn() && <NavLink activeClassName="nav__link--active" className="nav__link" to="/profile">Profile</NavLink>}
				<span id="title">{process.env.REACT_APP_TITLE}</span>
				{Auth.isLoggedIn() && <button className="nav__button" onClick={logout} type="button">Logout</button>}
			</div>
		</header>
	);
}
