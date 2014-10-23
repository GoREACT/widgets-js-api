exports.init = function () {
    console.log('init');

    setTimeout(function(){
        exports.fire('init::complete');
    }, 1000);
};