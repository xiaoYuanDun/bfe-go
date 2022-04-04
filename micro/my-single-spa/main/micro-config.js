import { registerApplication, start } from "single-spa";


// Simple usage
registerApplication(
	'data-app',
	() => import('src/app2/main.js'),
	(location) => location.pathname.startsWith('/app2'),
	{ some: 'value' }
);


