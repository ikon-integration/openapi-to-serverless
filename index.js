#!/usr/bin/env node

// Set options as a parameter, environment variable, or rc file.
// eslint-disable-next-line no-global-assign
require = require('esm')(module /*, options*/);
const Converter = require('./main.js').Converter;
new Converter(process.argv).run();
