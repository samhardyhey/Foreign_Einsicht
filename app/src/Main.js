import React, { Component } from 'react';
import { Route, NavLink, BrowserRouter } from 'react-router-dom';

import Home from './Home';
import Content from './Content';

class Main extends Component {
    render() {
        return (
            <BrowserRouter>
            <div>
			    <div>
			        <h1>Foreign Einsicht</h1>
			        <h2>Insights into German media</h2>
			    </div>
				<ul className="header">
					<li><NavLink exact to="/">Home</NavLink></li>
					<li><NavLink to="/spiegel">Der Spiegel</NavLink></li>
					<li><NavLink to="/bild">Bild</NavLink></li>
					<li><NavLink to="/tagesspiegel">Der Tagesspiegel</NavLink></li>
					<li><NavLink to="/zeit">Die Zeit</NavLink></li>
					<li><NavLink to="/gruenderszene">Gruenderszene</NavLink></li>
					<li><NavLink to="/handelsblatt">Handelsblatt</NavLink></li>
				</ul>
				
				<div className="content"> 
					<Route exact path="/" component={Home}/>
					<Route path="/spiegel" render={(props)=><Content {...props} source={'spiegel-online'}/>}/>
					<Route path="/bild" render={(props)=><Content {...props} source={'bild'}/>}/>
					<Route path="/tagesspiegel" render={(props)=><Content {...props} source={'der-tagesspiegel'}/>}/>
					<Route path="/zeit" render={(props)=><Content {...props} source={'die-zeit'}/>}/>
					<Route path="/gruenderszene" render={(props)=><Content {...props} source={'gruenderszene'}/>}/>
					<Route path="/handelsblatt" render={(props)=><Content {...props} source={'handelsblatt'}/>}/>
				</div>

			    <footer>
			        <div>
			            <p className="text-muted">Built using the News API and Google's natural language API and translation API.</p>
			        </div>
			    </footer>
			</div>
			</BrowserRouter>
        );
    }
}

export default Main;