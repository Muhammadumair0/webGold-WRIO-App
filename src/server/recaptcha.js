/**
 * Created by michbil on 31.10.16.
 */

import request from 'superagent';
import nconf from './wrio_nconf';
import logger from 'winston';
import {utils} from 'wriocommon'; const dumpError = utils.dumpError;

/**
 * Verify captcha request to Google servers
 * @param response
 * @returns {*}
 */

const verifyCaptcha = async (response) => {
    logger.info('Checking captcha', response);
    const r = await request.post('https://www.google.com/recaptcha/api/siteverify')
    .type("form")
    .accept("json")
    .send({
        secret: nconf.get('recaptcha:secret'),
        response: response
    });
    logger.debug(r.body);
    return r.body.success;
};


/**
 * Verify captcha middleware
 * @param request
 * @param response
 * @param next
 */

const verifyMiddleware = async (request,response,next) => {
    try {
        const captcha = request.body['g-recaptcha-response'];
        const result = await verifyCaptcha(captcha);

        console.log("GoT cap",result);

        if (captcha && result == true) {
            logger.error("Captcha check succeeded");
            return next();
        }
        logger.error("Captcha check failed");
        response.status(400).send("Wrong captcha");

    } catch(e) {
        dumpError(e);
        logger.error(e);
        return response.status(500).send("Internal server error");
    }

};


export default verifyMiddleware;