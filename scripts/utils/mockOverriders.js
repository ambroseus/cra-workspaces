const path = require('path');
const mock = require('mock-require');
const root = process.cwd();
const findMonorepo = require('./findMonorepo');
mock(path.join(root, 'config-overrides'), (config, env) => {
	const babelLoaderFilter = rule =>
		rule.loader &&
		rule.loader.includes('babel') &&
		rule.options &&
		rule.options.plugins;

	// First, try to find the babel loader inside the oneOf array.
	// This is where we can find it when working with react-scripts@2.0.3.
	let loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf))
		.oneOf;

	let babelLoader = loaders.find(babelLoaderFilter);

	// If the loader was not found, try to find it inside of the "use" array, within the rules.
	// This should work when dealing with react-scripts@2.0.0.next.* versions.
	if (!babelLoader) {
		loaders = loaders.reduce((acc, rule) => acc.concat(rule.use || []), []);
		babelLoader = loaders.find(babelLoaderFilter);
	}
	babelLoader.include = [babelLoader.include].concat(findMonorepo(root));
	return config;
});
