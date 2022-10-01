import { Route, Switch } from 'react-router-dom';
import Auth from './Utilities/Auth';
import Calendar from './Pages/Calendar';
import Charts from './Pages/Charts';
import Diary from './Pages/Diary';
import EntryEdit from './Pages/Entries/Edit';
import Error404 from './Error404';
import FoodEdit from './Pages/Food/Edit';
import FoodList from './Pages/Food/List';
import FoodNew from './Pages/Food/New';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import Login from './Pages/Auth/Login';
import MealEdit from './Pages/Meals/Edit';
import MealList from './Pages/Meals/List';
import MealNew from './Pages/Meals/New';
import Profile from './Pages/Users/Edit';
import React from 'react';
import Register from './Pages/Auth/Register';
import ResetPassword from './Pages/Auth/ResetPassword';

export default function Routes() {
	if (!Auth.isLoggedIn()) {
		return (
			<Switch>
				<Route exact path="/"><Login /></Route>
				<Route exact path="/register"><Register /></Route>
				<Route exact path="/forgot-password"><ForgotPassword /></Route>
				<Route exact path="/reset-password/:token"><ResetPassword /></Route>
				<Route><Error404 /></Route>
			</Switch>
		);
	}

	return (
		<Switch>
			<Route exact path="/"><Diary /></Route>
			<Route exact path="/calendar"><Calendar /></Route>
			<Route exact path="/charts"><Charts /></Route>
			<Route exact path="/entries/:id(\d+)"><EntryEdit /></Route>
			<Route exact path="/profile"><Profile /></Route>
			<Route exact path="/food"><FoodList /></Route>
			<Route exact path="/food/new"><FoodNew /></Route>
			<Route exact path="/food/:id(\d+)"><FoodEdit /></Route>
			<Route exact path="/meals"><MealList /></Route>
			<Route exact path="/meals/new"><MealNew /></Route>
			<Route exact path="/meals/:id(\d+)"><MealEdit /></Route>
			<Route><Error404 /></Route>
		</Switch>
	);
}
