async function directoryMiddleware(req, res, next) {
    const serviceMap = {
        miiverse: 'offdevice',
        portal: 'portal',
        n3ds: 'n3ds'
    };

    const envMap = {
        l1: 'live',
        t1: 'test',
        d1: 'dev'
    };

    let service = 'portal';
    let environment = 'live';

    const sub = req.subdomains.find(sd => sd.includes('-'));

    if (sub) {
        const [svc, env] = sub.split('-');

        if (serviceMap[svc]) {
            service = serviceMap[svc];
        }

        if (envMap[env]) {
            environment = envMap[env];
        }
    } else {
        const simpleSub = req.subdomains.find(sd => serviceMap[sd]);
        if (simpleSub) {
            service = serviceMap[simpleSub];
        }
    }

    req.directory = service;
    req.environment = environment;

    const write_methods = new Set(['POST', 'PUT', 'DELETE']);
    req.isWrite = write_methods.has(req.method.toUpperCase());

    return next();
}

module.exports = { directoryMiddleware };