import Cookies from 'js-cookie';

export default class Auth {
	static login(user, token, remember) {
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(remember));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_token`, token, Auth.attributes(remember));
	}

	static refresh() {
		let user = Auth.user();
		user = user ? JSON.parse(user) : null;
		if (user && user.remember) {
			Auth.login(user, Auth.token(), user.remember);
		}
	}

	static attributes(remember) {
		const attributes = {
			sameSite: 'lax',
		};
		if (remember) {
			attributes.expires = 365;
		}
		if (window.location.protocol === 'https:') {
			attributes.secure = true;
		}
		return attributes;
	}

	static logout() {
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
		Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
		window.location.href = window.location.origin + process.env.PUBLIC_URL;
	}

	static id() {
		const user = Auth.user();
		return user ? JSON.parse(user).id : null;
	}

	static isAdmin() {
		const user = Auth.user();
		return user ? JSON.parse(user).is_admin : false;
	}

	static weightUnits() {
		const user = Auth.user();
		const measurementUnits = user ? JSON.parse(user).measurement_units : '';
		if (measurementUnits === 'i') {
			return 'lbs';
		}
		if (measurementUnits === 'm') {
			return 'kgs';
		}
		return '';
	}

	static setWeightUnits(units) {
		let user = Auth.user();
		user = user ? JSON.parse(user) : [];
		user.measurement_units = units;
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(user.remember));
	}

	static hasTrackables() {
		return Auth.trackables().length > 0;
	}

	static setTrackables(trackables) {
		let user = Auth.user();
		user = user ? JSON.parse(user) : [];
		user.trackables = trackables.map((trackable) => (trackable.slug));
		Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_user`, JSON.stringify(user), Auth.attributes(user.remember));
	}

	static trackables() {
		const user = Auth.user();
		return user ? JSON.parse(user).trackables : [];
	}

	static user() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_user`);
	}

	static token() {
		return Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_token`);
	}

	static isLoggedIn() {
		return !!Auth.user() && !!Auth.token();
	}
}
