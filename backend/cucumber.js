export default {
  default: {
    requireModule: [],
    require: ['tests/steps/**/*.js'],
    import: ['tests/steps/**/*.js'],
    paths: ['tests/features/*.feature'],
    format: ['progress-bar', 'html:cucumber-report.html'],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    publishQuiet: true
  }
};
