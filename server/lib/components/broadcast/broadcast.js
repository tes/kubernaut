import AWS from 'aws-sdk';

export default function () {

  function start({ config, logger }, cb) {
    let sns, TopicArn;

    const formatFuncs = {
      deployment: (d) => {
        try {
          return `${d.release.service.registry.name}/${d.release.service.name} deployed to ${d.namespace.cluster.name}/${d.namespace.name} by ${d.createdBy.displayName}`;
        } catch (e) {
          logger.error('Error formatting deployment');
          return '';
        }
      },
    };

    if (config.sns) {
      TopicArn = config.sns.TopicArn;
      sns = new AWS.SNS({
        ...config.sns,
      });

      logger.info(`Configured to send to sns topic ${TopicArn}`);
    }

    const sendMessageSNS = async (message) => {
      if (sns) {
        await sns.publish({
          Message: JSON.stringify(message),
          TopicArn,
        }).promise();
      }
    };

    const broadcast = async (message) => {
      logger.debug(`Broadcasting message: ${JSON.stringify(message)}`);
      await sendMessageSNS(message);
    };
    broadcast.format = formatFuncs;

    return cb(null, broadcast);
  }

  return {
    start,
  };
}
