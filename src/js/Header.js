import { Api, FormosaContext } from '@jlbelanger/formosa';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import React, { useContext } from 'react';
import Auth from './Utilities/Auth';

export default function Header() {
	const { addToast } = useContext(FormosaContext);
	const location = useLocation();
	const history = useHistory();

	const logout = () => {
		Api.delete('auth/logout')
			.catch((response) => {
				if (response.status === 401) {
					return;
				}
				addToast('Error.', 'error');
				throw response;
			})
			.then(() => {
				Auth.logout(history);
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
