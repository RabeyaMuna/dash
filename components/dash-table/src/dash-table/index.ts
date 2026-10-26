import 'regenerator-runtime/runtime'; // polyfill required by @plotly/dash-component-plugins' asyncDecorator
import 'css.escape'; // polyfill

import Environment from 'core/environment';
import Logger from 'core/Logger';

import DataTable from 'dash-table/dash/DataTable';

Logger.setDebugLevel(Environment.debugLevel);
Logger.setLogLevel(Environment.logLevel);

export {DataTable};
