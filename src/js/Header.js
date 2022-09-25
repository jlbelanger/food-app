import { Api, FormosaContext } from '@jlbelanger/formosa';
import { Link, NavLink, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import Auth from './Utilities/Auth';

export default function Header() {
	const { addToast } = useContext(FormosaContext);
	const location = useLocation();

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
				addToast('Error.', 'error');
			});
	};

	return (
		<header id="header">
			<div className="contain" id="header__contain">
				{Auth.isLoggedIn() && <NavLink activeClassName="nav__link--active" className="nav__link" to="/profile">Profile</NavLink>}
				<Link id="title" to="/">{process.env.REACT_APP_TITLE}</Link>
				{Auth.isLoggedIn() && (
					<button className="nav__button" disabled={location.pathname !== '/profile'} onClick={logout} type="button">Logout</button>
				)}
			</div>
		</header>
	);
}
