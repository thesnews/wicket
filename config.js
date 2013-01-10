var config = {};

switch( process.env.NODE_ENV ) {
    case 'production':
        config = {
            'crypt':        '',
            'port':         false
        };
        break;

    case 'development' :
    default :
        config = {
            'crypt':        '',
            'port':         8888
        };
        break;
}

module.exports = config;
