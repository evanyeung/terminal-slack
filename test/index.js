/**
 * Container for test
 */

// Override the NODE_ENV variable
process.env.NODE_ENV = 'testing';

// Application logic for the test runner
const _app = {};

// Container for the test
_app.tests = {};

// Add on the unit tests
_app.tests.unit = require('./unit');
_app.tests.api = require('./api');

// Produce a test outcome report
_app.producetestreport = (limit, successes, errors) => {
  console.log('');
  console.log('---------------------------BEGIN THE REPORT--------------------------');
  console.log('');
  console.log('\t\x1b[33m%s: %s\x1b[0m', 'Total', limit);
  console.log('\t\x1b[32m%s: %s\x1b[0m', 'Pass', successes);
  console.log('\t\x1b[31m%s: %s\x1b[0m', 'Fail', errors.length);

  // If there are errors, print them in detail
  if (errors.length > 0) {
    console.log('---------------------------BEGIN ERROR DETAILS--------------------------');
    console.log('');
    errors.forEach((error) => {
      console.log('\x1b[31m%s\x1b[0m', error.name);
      console.log(error.error);
      console.log('');
    });
    console.log('');
    console.log('---------------------------END ERROR DETAILS--------------------------');
  }

  console.log('');
  console.log('---------------------------END THE REPORT--------------------------');
  process.exit(0);
};

// Count all the test
_app.countTest = () => {
  let counter = 0;
  Object.values(_app.tests).forEach((tests) => {
    counter += Object.keys(tests).length;
  });
  return counter;
};

_app.runTest = () => {
  let limit = _app.countTest();
  let successes = 0;
  let errors = [];
  let counter = 0;

  console.log('\n');

  Object.values(_app.tests)
    .forEach((subTest) => {
      Object.entries(subTest)
        .forEach(([name, fn]) => {
          try {
            fn(() => {
              // If it cals back without throwing, then is successed, so log it in green
              console.log('\x1b[32m%s\x1b[0m', name);
              successes++;
              counter++;

              if (counter === limit) {
                // show results
                _app.producetestreport(limit, successes, errors);
              }
            });
          }
          catch (error) {
            // If it throws, then it failed, so capture the error trown and log it in read
            console.log('\x1b[31m%s\x1b[0m', name);
            errors.push({
              name,
              error,
            });
            counter++;

            if (counter === limit) {
              // show results
              _app.producetestreport(limit, successes, errors);
            }
          }
        });
    });
};

// Run the test
_app.runTest();
