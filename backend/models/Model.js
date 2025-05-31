const mongoose = require('mongoose');

const ModelSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'anonymous' },
  datasetUrl: { type: String, required: true },
  modelUrl: { type: String },
  docUrl: { type: String },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'uploading', 'processing', 'completed', 'failed', 'updated'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  trainingMetadata: {
    trainingTime: Number,
    modelType: String,
    datasetSize: Number,
    featureCount: Number
  }
});

ModelSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Model', ModelSchema);
