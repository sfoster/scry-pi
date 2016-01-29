// get config,
// instantiate widget and backing jobs
// populate each slot

  document.addEventListener('DOMContentLoaded', function(event) {
    console.log('main: init dashboard');
    window.dashboard = new Dashboard({
      node: document.getElementById('wrapper')
    });
    window.dashboard.init();
  });