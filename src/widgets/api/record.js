exports.record = function () {
    console.log('record');
    exports.fire('record::complete');
};
