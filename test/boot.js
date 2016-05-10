/**
 * This file will be called first before running any tests
 * If there are any dependencies need to be cached or some functions required to be run
 * before starting tests, just put them here.
 * Any cache will stay until tests are over.
 */

// --------------------------------------------------------

/**
 * Bootstrap application before all tests
 */
var dbMock = require('./dbTestConfig');
var app = require('../app')(dbMock);

/**
 * Bootstrap other dependencies, if any
 */
