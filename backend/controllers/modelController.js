const cloudinary = require('cloudinary').v2;
const { exec } = require('child_process');
const path = require('path');
const Model = require('../models/Model');
const jobQueue = require('../middleware/jobQueue');
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

exports.createModel = async (req, res, next) => {
  try {
    const { description } = req.body;
    const dataset = req.file;

    logger.info('Uploading dataset to Cloudinary', { description });

    // Upload dataset to Cloudinary
    const datasetUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'datasets' },
        (error, result) => {
          if (error) reject(new Error('Cloudinary upload failed: ' + error.message));
          else resolve(result);
        }
      ).end(dataset.buffer);
    });

    // Save metadata to MongoDB
    const modelEntry = new Model({
      userId: 'anonymous',
      datasetUrl: datasetUpload.secure_url,
      description,
      status: 'uploading',
    });
    await modelEntry.save();

    // Queue job for model training
    jobQueue.push(
      {
        exec,
        pythonScript: path.join(__dirname, '../../python/train_model.py'),
        datasetUrl: datasetUpload.secure_url,
        description,
        modelEntry,
      },
      (err, result) => {
        if (err) {
          return next(err);
        }
        res.json({
          modelId: modelEntry._id,
          modelUrl: result.modelUrl,
          docUrl: result.docUrl,
          status: 'completed',
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

exports.getAllModels = async (req, res, next) => {
  try {
    const { page, limit, status, startDate, endDate } = req.query;
    const query = { userId: 'anonymous' };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const models = await Model.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Model.countDocuments(query);

    res.json({
      models,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getModel = async (req, res, next) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      const error = new Error('Model not found');
      error.status = 404;
      throw error;
    }
    res.json(model);
  } catch (err) {
    next(err);
  }
};

exports.updateModel = async (req, res, next) => {
  try {
    const { description, retrain } = req.body;
    const model = await Model.findById(req.params.id);
    if (!model) {
      const error = new Error('Model not found');
      error.status = 404;
      throw error;
    }

    model.description = description;
    model.status = 'updated';
    await model.save();

    if (retrain) {
      jobQueue.push(
        {
          exec,
          pythonScript: path.join(__dirname, '../../python/train_model.py'),
          datasetUrl: model.datasetUrl,
          description,
          modelEntry: model,
        },
        (err) => {
          if (err) {
            logger.error('Retraining failed', { modelId: model._id });
          }
        }
      );
    }

    logger.info('Model updated', { modelId: model._id });
    res.json({ message: 'Model updated successfully', model });
  } catch (err) {
    next(err);
  }
};

exports.deleteModel = async (req, res, next) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      const error = new Error('Model not found');
      error.status = 404;
      throw error;
    }

    // Delete files from Cloudinary
    const deletePromises = [];
    if (model.datasetUrl) {
      const publicId = model.datasetUrl.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(`datasets/${publicId}`, { resource_type: 'raw' }));
    }
    if (model.modelUrl) {
      const publicId = model.modelUrl.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(`models/${publicId}`, { resource_type: 'raw' }));
    }
    if (model.docUrl) {
      const publicId = model.docUrl.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(`docs/${publicId}`, { resource_type: 'raw' }));
    }
    await Promise.all(deletePromises);

    // Delete from MongoDB
    await model.deleteOne();

    logger.info('Model deleted', { modelId: req.params.id });
    res.json({ message: 'Model deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getModelStatus = async (req, res, next) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) {
      const error = new Error('Model not found');
      error.status = 404;
      throw error;
    }
    res.json({ modelId: model._id, status: model.status });
  } catch (err) {
    next(err);
  }
};
