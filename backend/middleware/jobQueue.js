const async = require('async');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console(),
  ],
});

const jobQueue = async.queue((task, callback) => {
  const { exec, pythonScript, datasetUrl, description, modelEntry } = task;
  logger.info('Processing job', { modelId: modelEntry._id });
  modelEntry.status = 'processing';
  modelEntry.save().then(() => {
    exec(`python ${pythonScript} "${datasetUrl}" "${description}"`, async (err, stdout, stderr) => {
      if (err) {
        logger.error('Python script execution failed', { error: stderr, modelId: modelEntry._id });
        modelEntry.status = 'failed';
        await modelEntry.save();
        callback(err);
        return;
      }
      const [modelUrl, docUrl] = stdout.trim().split('\n').map(line => line.split(': ')[1]);
      modelEntry.modelUrl = modelUrl;
      modelEntry.docUrl = docUrl;
      modelEntry.status = 'completed';
      modelEntry.trainingMetadata = {
        trainingTime: Math.floor(Math.random() * 1000), // Placeholder
        modelType: 'LogisticRegression', // Placeholder
        datasetSize: Math.floor(Math.random() * 1000000), // Placeholder
        featureCount: Math.floor(Math.random() * 100) // Placeholder
      };
      await modelEntry.save();
      logger.info('Job completed', { modelId: modelEntry._id });
      callback(null, { modelUrl, docUrl });
    });
  }).catch(callback);
}, 2); // Limit to 2 concurrent jobs

module.exports = jobQueue;
